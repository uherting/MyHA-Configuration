function rename_resources {
  for a in l2btproxy_lounge l2btproxy_bedroom l2btproxy_bathroom l2btproxy_kitchen
  do 
    an=`echo ${a} | tr -d '_'`
    for f in `find ./ -name ${an}.yaml`
    do 
      echo ${f}
      sed -i -e "s/${a}/${an}/g" ${f}
    done
    echo "========";
  done
}

function rename_files {
  for a in l2btproxy_lounge l2btproxy_bedroom l2btproxy_bathroom l2btproxy_kitchen
  do 
    for f in `find ./ -name ${a}.yaml`
    do 
      fn=`echo ${a} | tr -d '_'`
      d=`dirname ${f}`
      fnn="${d}/${fn}.yaml"
      echo ${f} ${fnn}
      mv ${f} ${fnn}
    done
    echo "========";
  done
}

function rename_dirs {
  for a in l2btproxy_lounge l2btproxy_bedroom l2btproxy_bathroom l2btproxy_kitchen
  do 
    for f in `find ./ -type d -name ${a}`
    do 
      fn=`echo ${a} | tr -d '_'`
      d=`dirname ${f}`
      fnn="${d}/${fn}"
      echo ${f} ${fnn}
      mv ${f} ${fnn}
    done
    echo "========";
  done
}

# rename_dirs
# rename_files

rename_resources
