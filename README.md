# BBone_Decom

A tool made by SproutNan that decodes the bbone animation files of "Plants vs. Zombies Online" into JSON format, and provides a front-end animation viewer for preview. English translation is provided by PoRa.

## Functions

- Decode bbone files to generate animation data and image resources in JSON format
- Provide a front-end animation viewer that can play the generated animation in sections
- Convert the frame currently shown into a PNG, using the html2canvas library

## How to Use

### Decoding bbone files

In your BBone_Decom-main folder, open Terminal. If you haven't installed Python3, type:

```bash
$ python3
```

This will open the installer if you haven't installed Python3. After installing, type:

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

After running, a new folder will be generated in the BBone_Decom-main folder, and the segmented animation data and image resources will be stored in the corresponding folder.

### Play Animation

1. Use Chrome browser to open `animation_player/index.html`
2. Import all the contents (images + JSON) in the exported target folder. Not all sprites need to be imported, but the JSON must be present.
3. Click Play; if there are too many parts, it may be stuck at the beginning, please be patient.

### Convert to PNG
The Convert to PNG button will convert the frame currently shown into PNG format. Note that the size of the PNG is proportional to the size of the animation viewer page.
