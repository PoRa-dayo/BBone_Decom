# Step1: 解压
import os
import sys
from unzip import unzip
from pathlib import Path
import shutil

file_path = sys.argv[1]
object_name, plugin_contents = unzip(file_path)

path_to_file = Path(file_path)
parent_dir = path_to_file.parent
result = Path(parent_dir, object_name)
if result.exists():
    shutil.rmtree(str(result), ignore_errors=True)

result.mkdir(exist_ok=True)

json_file = {}

# Step2：分解并保存贴图
from split_atlas import split_atlas, get_split_json
from get_atlas import parse_atlas
import json

atlas = parse_atlas(plugin_contents[1])
plist = get_split_json(plugin_contents[1])

json_file["plist"] = plist

split_atlas(plist, str(result), atlas)

# Step3：提取动画帧标签
from get_animation_labels import parse_frame_labels

labels = parse_frame_labels(plugin_contents[3])

json_file["labels"] = labels

# Step4：提取动画文件
from get_animation import get_animation_json
import json

animation_json = get_animation_json(plugin_contents[2])

json_file["animation"] = animation_json

# Step5：导出json

with open(f"{str(result)}/animation.json", "w") as out:
    json.dump(json_file, out, indent=4, ensure_ascii=False)
