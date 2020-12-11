"""Global context handling."""

import logging
import os
from types import ModuleType

from .const import CONF_HASS_IS_GLOBAL, CONFIG_ENTRY, DOMAIN, FOLDER, LOGGER_PATH
from .eval import AstEval
from .function import Function
from .trigger import TrigInfo

_LOGGER = logging.getLogger(LOGGER_PATH + ".global_ctx")


class GlobalContext:
    """Define class for global variables and trigger context."""

    def __init__(
        self,
        name,
        global_sym_table=None,
        manager=None,
        rel_import_path=None,
        app_config=None,
        source=None,
        mtime=None,
    ):
        """Initialize GlobalContext."""
        self.name = name
        self.global_sym_table = global_sym_table if global_sym_table else {}
        self.triggers = set()
        self.triggers_delay_start = set()
        self.logger = logging.getLogger(LOGGER_PATH + "." + name)
        self.manager = manager
        self.auto_start = False
        self.module = None
        self.rel_import_path = rel_import_path
        self.source = source
        self.file_path = None
        self.mtime = mtime
        self.app_config = app_config
        self.imports = set()
        config_entry = Function.hass.data.get(DOMAIN, {}).get(CONFIG_ENTRY, {})
        if config_entry.data.get(CONF_HASS_IS_GLOBAL, False):
            #
            # expose hass as a global variable if configured
            #
            self.global_sym_table["hass"] = Function.hass

    def trigger_register(self, func):
        """Register a trigger function; return True if start now."""
        self.triggers.add(func)
        if self.auto_start:
            return True
        self.triggers_delay_start.add(func)
        return False

    def trigger_unregister(self, func):
        """Unregister a trigger function."""
        self.triggers.discard(func)
        self.triggers_delay_start.discard(func)

    def set_auto_start(self, auto_start):
        """Set the auto-start flag."""
        self.auto_start = auto_start

    def start(self):
        """Start any unstarted triggers."""
        for func in self.triggers_delay_start:
            func.trigger_start()
        self.triggers_delay_start = set()

    def stop(self):
        """Stop all triggers and auto_start."""
        for func in self.triggers:
            func.trigger_stop()
        self.triggers = set()
        self.triggers_delay_start = set()
        self.set_auto_start(False)

    def get_name(self):
        """Return the global context name."""
        return self.name

    def get_global_sym_table(self):
        """Return the global symbol table."""
        return self.global_sym_table

    def get_source(self):
        """Return the source code."""
        return self.source

    def get_app_config(self):
        """Return the app config."""
        return self.app_config

    def get_mtime(self):
        """Return the mtime."""
        return self.mtime

    def get_file_path(self):
        """Return the file path."""
        return self.file_path

    def get_imports(self):
        """Return the imports."""
        return self.imports

    def get_trig_info(self, name, trig_args):
        """Return a new trigger info instance with the given args."""
        return TrigInfo(name, trig_args, self)

    async def module_import(self, module_name, import_level):
        """Import a pyscript module from the pyscript/modules or apps folder."""

        pyscript_dir = Function.hass.config.path(FOLDER)
        module_path = module_name.replace(".", "/")
        file_paths = []

        def find_first_file(file_paths):
            for ctx_name, path, rel_path in file_paths:
                abs_path = os.path.join(pyscript_dir, path)
                if os.path.isfile(abs_path):
                    return [ctx_name, abs_path, rel_path]
            return None

        #
        # first build a list of potential import files
        #
        if import_level > 0:
            if self.rel_import_path is None:
                raise ImportError("attempted relative import with no known parent package")
            path = self.rel_import_path
            if path.endswith("/__init__"):
                path = os.path.dirname(path)
            ctx_name = self.name
            for _ in range(import_level - 1):
                path = os.path.dirname(path)
                idx = ctx_name.rfind(".")
                if path.find("/") < 0 or idx < 0:
                    raise ImportError("attempted relative import above parent package")
                ctx_name = ctx_name[0:idx]
            ctx_name += f".{module_name}"
            module_info = [ctx_name, f"{path}/{module_path}.py", path]
            path += f"/{module_path}"
            file_paths.append([ctx_name, f"{path}/__init__.py", path])
            file_paths.append(module_info)
            module_name = ctx_name[ctx_name.find(".") + 1 :]

        else:
            if self.rel_import_path is not None and self.rel_import_path.startswith("apps/"):
                ctx_name = f"apps.{module_name}"
                file_paths.append([ctx_name, f"apps/{module_path}/__init__.py", f"apps/{module_path}"])
                file_paths.append([ctx_name, f"apps/{module_path}.py", f"apps/{module_path}"])

            ctx_name = f"modules.{module_name}"
            file_paths.append([ctx_name, f"modules/{module_path}/__init__.py", f"modules/{module_path}"])
            file_paths.append([ctx_name, f"modules/{module_path}.py", None])

        #
        # now see if we have loaded it already
        #
        for ctx_name, _, _ in file_paths:
            mod_ctx = self.manager.get(ctx_name)
            if mod_ctx and mod_ctx.module:
                self.imports.add(mod_ctx.get_name())
                return [mod_ctx.module, None]

        #
        # not loaded already, so try to find and import it
        #
        file_info = await Function.hass.async_add_executor_job(find_first_file, file_paths)
        if not file_info:
            return [None, None]

        [ctx_name, file_path, rel_import_path] = file_info

        mod = ModuleType(module_name)
        global_ctx = GlobalContext(
            ctx_name, global_sym_table=mod.__dict__, manager=self.manager, rel_import_path=rel_import_path
        )
        global_ctx.set_auto_start(True)
        _, error_ctx = await self.manager.load_file(global_ctx, file_path)
        if error_ctx:
            _LOGGER.error(
                "module_import: failed to load module %s, ctx = %s, path = %s",
                module_name,
                ctx_name,
                file_path,
            )
            return [None, error_ctx]
        global_ctx.module = mod
        self.imports.add(ctx_name)
        return [mod, None]


class GlobalContextMgr:
    """Define class for all global contexts."""

    #
    # map of context names to contexts
    #
    contexts = {}

    #
    # sequence number for sessions
    #
    name_seq = 0

    def __init__(self):
        """Report an error if GlobalContextMgr in instantiated."""
        _LOGGER.error("GlobalContextMgr class is not meant to be instantiated")

    @classmethod
    def init(cls):
        """Initialize GlobalContextMgr."""

        def get_global_ctx_factory(ast_ctx):
            """Generate a pyscript.get_global_ctx() function with given ast_ctx."""

            async def get_global_ctx():
                return ast_ctx.get_global_ctx_name()

            return get_global_ctx

        def list_global_ctx_factory(ast_ctx):
            """Generate a pyscript.list_global_ctx() function with given ast_ctx."""

            async def list_global_ctx():
                ctx_names = set(cls.contexts.keys())
                curr_ctx_name = ast_ctx.get_global_ctx_name()
                ctx_names.discard(curr_ctx_name)
                return [curr_ctx_name] + sorted(sorted(ctx_names))

            return list_global_ctx

        def set_global_ctx_factory(ast_ctx):
            """Generate a pyscript.set_global_ctx() function with given ast_ctx."""

            async def set_global_ctx(name):
                global_ctx = cls.get(name)
                if global_ctx is None:
                    raise NameError(f"global context '{name}' does not exist")
                ast_ctx.set_global_ctx(global_ctx)
                ast_ctx.set_logger_name(global_ctx.name)

            return set_global_ctx

        ast_funcs = {
            "pyscript.get_global_ctx": get_global_ctx_factory,
            "pyscript.list_global_ctx": list_global_ctx_factory,
            "pyscript.set_global_ctx": set_global_ctx_factory,
        }

        Function.register_ast(ast_funcs)

    @classmethod
    def get(cls, name):
        """Return the GlobalContext given a name."""
        return cls.contexts.get(name, None)

    @classmethod
    def set(cls, name, global_ctx):
        """Save the GlobalContext by name."""
        cls.contexts[name] = global_ctx

    @classmethod
    def items(cls):
        """Return all the global context items."""
        return sorted(cls.contexts.items())

    @classmethod
    def delete(cls, name):
        """Delete the given GlobalContext."""
        if name in cls.contexts:
            global_ctx = cls.contexts[name]
            global_ctx.stop()
            del cls.contexts[name]

    @classmethod
    def new_name(cls, root):
        """Find a unique new name by appending a sequence number to root."""
        while True:
            name = f"{root}{cls.name_seq}"
            cls.name_seq += 1
            if name not in cls.contexts:
                return name

    @classmethod
    async def load_file(cls, global_ctx, file_path, source=None, reload=False):
        """Load, parse and run the given script file; returns error ast_ctx on error, or None if ok."""

        mtime = None
        if source is None:

            def read_file(path):
                try:
                    with open(path) as file_desc:
                        source = file_desc.read()
                    return source, os.path.getmtime(path)
                except Exception as exc:
                    _LOGGER.error("%s", exc)
                    return None, 0

            source, mtime = await Function.hass.async_add_executor_job(read_file, file_path)

        if source is None:
            return False, None

        ctx_curr = cls.get(global_ctx.get_name())
        if ctx_curr:
            # stop triggers and destroy old global context
            ctx_curr.stop()
            cls.delete(global_ctx.get_name())

        #
        # create new ast eval context and parse source file
        #
        ast_ctx = AstEval(global_ctx.get_name(), global_ctx)
        Function.install_ast_funcs(ast_ctx)

        if not ast_ctx.parse(source, filename=file_path):
            exc = ast_ctx.get_exception_long()
            ast_ctx.get_logger().error(exc)
            global_ctx.stop()
            return False, ast_ctx
        await ast_ctx.eval()
        exc = ast_ctx.get_exception_long()
        if exc is not None:
            ast_ctx.get_logger().error(exc)
            global_ctx.stop()
            return False, ast_ctx
        global_ctx.source = source
        global_ctx.file_path = file_path
        if mtime is not None:
            global_ctx.mtime = mtime
        cls.set(global_ctx.get_name(), global_ctx)

        _LOGGER.info("%s %s", "Reloaded" if reload else "Loaded", file_path)

        return True, None
