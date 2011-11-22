#!/bin/sh
cd /home/dazzler/www/BAM/cron
OUT=`/usr/bin/php -q crontasks.php`
echo $OUT >> cron.log
