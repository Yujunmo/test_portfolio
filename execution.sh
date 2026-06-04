#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
echo ${ROOT}/frontend
start() {
  cd "$ROOT/backend"
  .venv/bin/python -m uvicorn app.main:app --reload &
  echo $! > /tmp/bigs_backend.pid

  cd "$ROOT/frontend"
  npm run dev &
  echo $! > /tmp/bigs_frontend.pid

  echo "Started backend(pid=$(cat /tmp/bigs_backend.pid)) and frontend(pid=$(cat /tmp/bigs_frontend.pid))"
}

stop() {
  # PID 파일로 종료
  for name in backend frontend; do
    pidfile="/tmp/bigs_${name}.pid"
    if [ -f "$pidfile" ]; then
      pid=$(cat "$pidfile")
      kill "$pid" 2>/dev/null && echo "Stopped $name (pid=$pid)"
      rm -f "$pidfile"
    fi
  done

  # uvicorn / vite 프로세스 잔존 시 추가 정리
  pkill -f "uvicorn app.main:app" 2>/dev/null
  pkill -f "vite" 2>/dev/null
  echo "All processes stopped."
}

case "$1" in
  start) start ;;
  stop)  stop  ;;
  *)     echo "Usage: $0 {start|stop}" ; exit 1 ;;
esac
