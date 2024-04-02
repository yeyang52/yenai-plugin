#!/bin/bash

echo -n "<div class='box' data-boxInfo='fastFetch'>"
if type fastfetch &>/dev/null; then
  if [ "$(uname)" = Linux ]; then
    fastfetch --pipe
  else
    fastfetch --stdout
  fi
else
  bash <(curl -L https://gitee.com/TimeRainStarSky/neofetch/raw/master/neofetch) --stdout
fi | \
sed -n 's|: |</p><p>|p' | \
while read i; do
  echo -n "<div class='speed'><p>$i</p></div>"
done
echo "</div>"

if type getprop &>/dev/null; then
  echo -n "<div class='box' data-boxInfo='安卓'>"
  echo "设备代号：$(getprop ro.product.device)
  设备型号：$(getprop ro.product.marketname) ($(getprop ro.product.name))
  认证型号：$(getprop ro.product.model)
  安卓版本：$(getprop ro.build.version.release) (SDK $(getprop ro.build.version.sdk))
  系统版本：$(getprop ro.build.version.incremental) ($(getprop ro.build.display.id))
  编译时间：$(date -d "@$(getprop ro.build.date.utc)" "+%F %T")
  基带版本：$(getprop gsm.version.baseband|cut -d ',' -f1)" | \
  sed -n 's|：|</p><p>|p' | \
  while read i; do
    echo -n "<div class='speed'><p>$i</p></div>"
  done
  echo "</div>"
fi