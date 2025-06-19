# BBone_Decom

A tool made by SproutNan that decodes the bbone animation files of "Plants vs. Zombies Online" into JSON format, and provides a front-end animation viewer for preview. English translation is provided by PoRa.

## Functions

- Decode bbone files to generate animation data and image resources in JSON format
- Provide a front-end animation viewer that can play the generated animation in sections
- Convert the frame currently shown into a PNG, using the html2canvas library

## How to Use

### Decoding bbone files

In your BBone_Decom-main folder, open Terminal. If you haven't installed Python, type:

```bash
$ python3
```

This will open the installer if you haven't installed Python. After installing, type:

```bash
$ exit
```

The decoder requires PIL and numpy libraries. To install these, type:

```bash
$ python3 -m pip install Pillow numpy
```

Now put the bbone files inside the BBone_Decom-main folder and type:

```bash
$ cd decoder
$ python3 main.py ../*.bbone
```

After running, an `outputs` folder will be generated in the `decoder` directory, and the segmented animation data and image resources will be stored in the corresponding folder.

### Play Animation

1. Use Chrome browser to open `animation_player/index.html`
2. Import all the contents (images + JSON) in the exported target folder. The JSON must be present.
3. Click Play; if there are too many parts, it may be stuck at the beginning, please be patient.
