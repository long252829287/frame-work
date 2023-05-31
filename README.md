# frame-work

## author

liuyl

### git代码提交至远程仓库流程：

1. 安装Git并在本地创建一个新的Git仓库。

2. 在该文件夹中，打开终端，并输入以下命令以初始化新的Git仓库
   
   `git init`

3. 关联本地Git仓库到远程Git仓库。

如果您还没有一个远程Git仓库，您需要先创建一个。在某个Git托管服务上（如GitHub、GitLab、Bitbucket等）上创建一个新的远程Git仓库。在该仓库的页面上可以看到仓库的URL地址。以GitHub为例，该地址类似于：

`[https://github.com/](https://github.com/)/.git`

回到您的本地Git仓库中，在终端中输入以下命令以将本地仓库关联到远程仓库：

`git remote add origin [https://github.com/](https://github.com/)/.git`

4. 将本地代码添加到Git仓库，并提交更改。

将您的代码添加到Git仓库可以使用以下命令：

`git add .`

提交更改并添加注释的命令如下：

`git commit -m "Initial commit"`

将更改推送到远程Git仓库：

`git push -u origin master`

这将把您的本地主分支（master）推送到远程Git仓库。

通过以上步骤，在您的远程Git仓库上，您应该能够看到您的本地代码。

如果您需要在其他电脑上下载您的代码并提交分支，请先在该电脑上安装Git，并使用以下命令来克隆您的远程仓库：

`git clone https://github.com/<your-username>/<your-repository>.git`

这将在您的本地计算机上创建一个新的文件夹，并克隆远程Git仓库到该文件夹中。之后，您就可以使用`git checkout -b <new-branch-name>`来创建一个新的分支并进行修改了。修改完成后，可以使用`git push origin <new-branch-name>`将这些更改推送到您的远程Git仓库中的新分支。

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### 前端仓库路径

/usr/local/webserver/nginx/html

### 后端仓库路径

/usr/local/server



---

## Nginx 安装

系统平台：CentOS release 6.6 (Final) 64位。

### 一、安装编译工具及库文件

yum -y install make zlib zlib-devel gcc-c++ libtool  openssl openssl-devel

### 二、首先要安装 PCRE

PCRE 作用是让 Nginx 支持 Rewrite 功能。

1、下载 PCRE 安装包，下载地址： [Download pcre-8.35.tar.gz (PCRE)](http://downloads.sourceforge.net/project/pcre/pcre/8.35/pcre-8.35.tar.gz)

[root@bogon src]# cd /usr/local/src/
[root@bogon src]# wget http://downloads.sourceforge.net/project/pcre/pcre/8.35/pcre-8.35.tar.gz

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx1.png)

2、解压安装包:

[root@bogon src]# tar zxvf pcre-8.35.tar.gz

3、进入安装包目录

[root@bogon src]# cd pcre-8.35

4、编译安装 

[root@bogon pcre-8.35]# ./configure
[root@bogon pcre-8.35]# make && make install

5、查看pcre版本

[root@bogon pcre-8.35]# pcre-config --version

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx2.png)

### 安装 Nginx

1、下载 Nginx，下载地址：[nginx: download](https://nginx.org/en/download.html)

[root@bogon src]# cd /usr/local/src/
[root@bogon src]# wget http://nginx.org/download/nginx-1.6.2.tar.gz

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx3.png) 2、解压安装包

[root@bogon src]# tar zxvf nginx-1.6.2.tar.gz

3、进入安装包目录

[root@bogon src]# cd nginx-1.6.2

4、编译安装

[root@bogon nginx-1.6.2]# ./configure --prefix=/usr/local/webserver/nginx --with-http_stub_status_module --with-http_ssl_module --with-pcre=/usr/local/src/pcre-8.35
[root@bogon nginx-1.6.2]# make
[root@bogon nginx-1.6.2]# make install

5、查看nginx版本

[root@bogon nginx-1.6.2]# /usr/local/webserver/nginx/sbin/nginx -v

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx4.png)

到此，nginx安装完成。

---

## Nginx 配置

创建 Nginx 运行使用的用户 www：

[root@bogon conf]# /usr/sbin/groupadd www 
[root@bogon conf]# /usr/sbin/useradd -g www www

配置nginx.conf ，将/usr/local/webserver/nginx/conf/nginx.conf替换为以下内容

[root@bogon conf]#  cat /usr/local/webserver/nginx/conf/nginx.conf
user www www;
worker_processes 2; #设置值和CPU核心数一致
error_log /usr/local/webserver/nginx/logs/nginx_error.log crit; #日志位置和日志级别
pid /usr/local/webserver/nginx/nginx.pid;
#Specifies the value for maximum file descriptors that can be opened by this process.
worker_rlimit_nofile 65535;
events
{
  use epoll;
  worker_connections 65535;
}
http
{
  include mime.types;
  default_type application/octet-stream;
  log_format main  '$remote_addr - $remote_user [$time_local] "$request" '
               '$status $body_bytes_sent "$http_referer" '
               '"$http_user_agent" $http_x_forwarded_for';
  
#charset gb2312;
       server_names_hash_bucket_size 128;
  client_header_buffer_size 32k;
  large_client_header_buffers 4 32k;
  client_max_body_size 8m;
       sendfile on;
  tcp_nopush on;
  keepalive_timeout 60;
  tcp_nodelay on;
  fastcgi_connect_timeout 300;
  fastcgi_send_timeout 300;
  fastcgi_read_timeout 300;
  fastcgi_buffer_size 64k;
  fastcgi_buffers 4 64k;
  fastcgi_busy_buffers_size 128k;
  fastcgi_temp_file_write_size 128k;
  gzip on;   gzip_min_length 1k;
  gzip_buffers 4 16k;
  gzip_http_version 1.0;
  gzip_comp_level 2;
  gzip_types text/plain application/x-javascript text/css application/xml;
  gzip_vary on;
   #limit_zone crawler $binary_remote_addr 10m;
 #下面是server虚拟主机的配置
 server  {
    listen 80;#监听端口
    server_name localhost;#域名
    index index.html index.htm index.php;
    root /usr/local/webserver/nginx/html;#站点目录
      location ~ .*\.(php|php5)?$    {
      #fastcgi_pass unix:/tmp/php-cgi.sock;
      fastcgi_pass 127.0.0.1:9000;
      fastcgi_index index.php;
      include fastcgi.conf;
    }
    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|ico)$    {
      expires 30d;
  # access_log off;
    }
    location ~ .*\.(js|css)?$    {
      expires 15d;
   # access_log off;
    }
    access_log off;
  }

}

检查配置文件nginx.conf的正确性命令：

[root@bogon conf]# /usr/local/webserver/nginx/sbin/nginx -t

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx5.png)

---

## 启动 Nginx

Nginx 启动命令如下：

[root@bogon conf]# /usr/local/webserver/nginx/sbin/nginx

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx6.png)

---

## 访问站点

从浏览器访问我们配置的站点ip：

![](https://www.runoob.com/wp-content/uploads/2015/01/nginx7.png)

---

## Nginx 其他命令

以下包含了 Nginx 常用的几个命令：

/usr/local/webserver/nginx/sbin/nginx -s reload            # 重新载入配置文件
/usr/local/webserver/nginx/sbin/nginx -s reopen            # 重启 Nginx
/usr/local/webserver/nginx/sbin/nginx -s stop              # 停止 Nginx

### 平台nginx配置

```js
user    root;
worker_processes  24;
error_log  /var/log/nginx/error.log;

events {
        worker_connections  1024;
}

http { 
        include       mime.types;
        default_type  application/octet-stream;
        sendfile        on;
        keepalive_timeout  65;
        keepalive_requests 1000;
        server_names_hash_bucket_size  128;
        client_header_buffer_size    320k;
        client_max_body_size    6g; 
        large_client_header_buffers  4 64k;
        access_log off;
        postpone_output  1460;
        client_header_timeout  3m;
        client_body_timeout    3m;
        send_timeout           3m;
        tcp_nopush             on;
        tcp_nodelay            on;
        limit_conn_zone $binary_remote_addr zone=addr:10m;
        gzip on;
        gzip_comp_level 9;
        gzip_min_length 1024;
        gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
        gzip_vary on;
        server_tokens off;

        #跨域请求配置
        add_header 'Access-Control-Allow-Origin' $http_origin;
        add_header 'Access-Control-Allow-Methods' 'GET,OPTIONS,PUT,DELETE,POST' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'cache-control,pragma,X-CSRFtoken,Authorization,DNT,User-Agent,Keep-Alive,Content-Type,accept,origin,X-Requested-With,content-range,accesstoken,userId,code,FingerPoint,no-cors' always;

        upstream zkcloud {
                                server  127.0.0.1:28000 max_fails=3 fail_timeout=10;
                server  127.0.0.1:26000 backup;
        }

        upstream zk_cmsm {
                server  127.0.0.1:8080;
        }

        upstream zkdevice {
                server  127.0.0.1:8088 max_fails=3 fail_timeout=5;
                server  127.0.0.1:8089 backup;
        }

        upstream zkai {
                server  127.0.0.1:8188;
        }

        upstream zk_interaction {
                server  127.0.0.1:23000;
        }

        upstream zk_manager {
                server  127.0.0.1:8180;
        }

        upstream zk_zhibo {
                server 127.0.0.1:8200;
        }

        upstream zk_wljy {
                server 127.0.0.1:8250;
        }

        server {
                listen       80;
                server_name  localhost;
                default_type 'text/html';
                charset utf-8;
                access_log  /var/log/nginx/zonekey_cloud_platform.log;
                root /home/mfsdate;
                ssi on;

                #静态资源访问
                location ^~ /static-server/pic/ {
                        alias /home/mfsdate/;
                }
                location ^~ /static-server/doc/ {
                        alias /home/mfsdate/;
                }
                location ^~ /static-server/video/ {
                        alias /home/mfsdate/;
                }

                #请求类型如果为OPTIONS，返回状态200
                if ($request_method = 'OPTIONS' ) {
                        return 200;
                }

                # 限制请求方法
                if ($request_method !~ ^(GET|HEAD|POST|OPTIONS)$ ) {
                        return 444;
                }

                # 过滤非法的UA
                if ($http_user_agent ~* "perl|ruby|bash|echo|uname|base64|decode|md5sum|select|concat|httprequest|nmap|scan" ) {
                        return 403;
                }

                # 过滤不支持的URL
                location ~* \.(bak|save|sh|sql|mdb|svn|git|old)$ {
                        rewrite ^/(.*)$  $host  permanent;
                }

                # 限制php执行
                location ~ /(attachments|upload)/.*.(php|php5)?$ {
                        deny all;
                }

                location ~ .*\.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm)$ {
                        expires      1d;
                }

                location ~ .*\.(?:js|css)$ {
                        expires      1d;
                }

                location ~ .*\.(?:htm|html)$ {
                         add_header Cache-Control "private, no-store, no-cache, must-revalidate, proxy-revalidate";
                }

                #微信H5页面访问
                location ^~ /h5 {
                    if (-d $request_filename) {
                        rewrite [^/]$ $scheme://$http_host$uri/ permanent;
                    }
                        alias /home/runprograms/configs-server/front;
                        index h5index.html;
                        break;
                }

                #移动教研页面访问
                location ^~ /ydjy {
                        alias /home/runprograms/configs-server/front/ydh5;
                        index index.html;
                        break;
                }

                location ^~ /static {
                        set $server_out_ip 36.112.70.172;
                        set $server_out_port 90;
                        if ($host = $server_out_ip){
                                rewrite ^(.*)$ http://$host:$server_out_port/ydjy/$uri;
                        }
                        rewrite ^(.*)$ http://$host:$server_port/ydjy/$uri;
                }

                #智课手机app访问
                location ^~ /WiClass/mobileapp {
                        alias /home/runprograms/configs-server/front/mobileapp;
                        index index.html;
                        break;
                }

                # 智播APP反向代理
                location ^~ /platform-app/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zk_zhibo;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                # 网络教研APP反向代理
                location ^~ /platform-zkt-app/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zk_wljy;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                #云平台websocket长连接设置
                location /platform/api/websocket {
                        proxy_pass http://zkcloud;
                        proxy_http_version 1.1;
                        proxy_read_timeout 1d;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "Upgrade";
                }

                #对部分请求进行https跳转
                location ^~ /mook/interaction {
                        rewrite ^(.*)$ https://$host/platform/index.html#$1 permanent;
                }

                #云平台web访问rewrite配置
                location ~ ^/$ {
                        set $server_out_ip 1.1.1.1;
                        set $server_out_port 28080;
                        if ($host = $server_out_ip){
                                rewrite ^/$ http://$host:$server_out_port/platform/index.html;
                        }
                        rewrite ^/$ http://$host:$server_port/platform/index.html;
                }

                #web模块反向代理配置
                location ^~ /platform {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        add_header    Cache-Control  max-age=28800;
                        proxy_intercept_errors on;
                        proxy_pass http://zkcloud;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                #互动相关配置
                location ^~ /interactionPlatform/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zk_interaction;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        proxy_read_timeout 1d;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "Upgrade";
                        break;
                }

                #老中控反向代理配置
                location ^~ /ManagerService {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zk_manager;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                #####以下为站点#####
                #站点websocket长连接设置,ws://ip:81/device-service/ws/loginName
                location ^~ /device-service/ws/ {
                        proxy_pass http://zkdevice;
                        proxy_http_version 1.1;
                        proxy_read_timeout 1d;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "Upgrade";
                }

                #站点websocket长链接设置
                location ^~ /ai-service/ws/ {
                        proxy_pass http://zkai;
                        proxy_http_version 1.1;
                        proxy_read_timeout 1d;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "Upgrade";
                }

                #ai数据相关
                location ^~ /ai-service/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zkai;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                #指定常态化转码服务主目录
                location ^~ /home/mfsdate/filetransdate/ {
                        root /;
                }

                location ^~ /cmsm/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zk_cmsm;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                location ^~ /device-service/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zkdevice/$request_uri;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        proxy_max_temp_file_size 5120m;
                        break;
                }

                #设备资产注册
                location /api/zdg/datagateway/syncstate {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_intercept_errors on;
                        proxy_pass http://zkdevice/device-service/control/onoff/syncstate;
                        proxy_set_header  X-Real-IP  $remote_addr;
                        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header Host $http_host;
                        break;
                }

                #资产设备报修管理
                location ^~ /cmsmh5 {
                    alias /home/tomcat/tomcat8080/webapps/cmsm/h5zcgl;
                    index index.html;
                    break;
                }

                #指定hls流观看地址
                location /hls {
                        types {
                                application/vnd.apple.mpegusr m3u8;
                                video/mp2t ts;
                        }
                        alias /home/mfsdate/hls/;
                        expires -1;
                }

                #支持flv流
                location /flv/ {
                        proxy_http_version 1.1;
                        proxy_set_header Connection "";
                        proxy_pass http://127.0.0.1:18080/;
                        add_header Cache-Control no-cache;
                        #add_header Access-Control-Allow-Origin *;
                        #add_header Access-Control-Allow-Credentials true;
                        #add_header Access-Control-Allow-Methods GET;
                }

                #zk_site
        }
        include /etc/nginx/conf.d/*.conf;
}
```
