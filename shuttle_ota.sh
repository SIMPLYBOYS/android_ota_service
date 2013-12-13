#! /bin/sh

NODE_ENV=production
DAEMON="node /home/aaron/shuttle_ota_full/cluster.js"
NAME=Shuttle_OTA
DESC=Shuttle_OTA
PIDFILE="/home/aaron/shuttle_ota_full/shuttleota.pid"

case "$1" in
  start)
        echo "Starting $DESC: "
                nohup $DAEMON > /dev/null &
        echo $! > $PIDFILE
        echo "$NAME. "
                    ;;  
  stop)
        echo "Stoping $DESC: "
              pid=`cat $PIDFILE`
        echo $pid
        rm $PIDFILE
        echo "$NAME. stop "
        kill $pid            
                    ;;
esac

exit 0
