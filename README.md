# BBone_Decom

一个将《植物大战僵尸 Online》的 BBone 动画文件解码成 JSON 格式的工具，并提供一个前端的动画播放器供预览。

## 功能

- 解码 BBone 文件，生成 JSON 格式的动画数据和图片资源
- 提供前端的动画播放器，可以按段落播放生成的动画

## 使用方法

### 解码 BBone 文件

```bash
$ cd decoder
$ python3 main.py /path/to/*.bbone
```

运行后，会在 `decoder` 目录下生成 `outputs` 文件夹，对应文件夹下存放分割好的动画数据和图片资源。

### 播放动画

1. 使用 Chrome 浏览器打开 `animation_player/index.html`
2. 将导出的目标文件夹下所有内容（图片+JSON）导入
3. 点击播放；如果零件数量太多可能一开始会卡顿，请耐心等待下

## 依赖库

```bash
$ python3 -m pip install Pillow numpy
```
