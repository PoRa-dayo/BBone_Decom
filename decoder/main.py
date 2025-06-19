# Step1: 解压
import os
import sys
from unzip import unzip
import shutil

file_path = sys.argv[1]
object_name, plugin_contents = unzip(file_path)

os.makedirs("output", exist_ok=True)

if os.path.exists(f"output/{object_name}"):
    shutil.rmtree(f"output/{object_name}")

os.makedirs(f"output/{object_name}", exist_ok=True)

json_file = {}

# Step2：分解并保存贴图
from split_atlas import split_atlas, get_split_json
from get_atlas import parse_atlas
import json

atlas = parse_atlas(plugin_contents[1])
plist = get_split_json(plugin_contents[1])

json_file["plist"] = plist

split_atlas(plist, f"output/{object_name}", atlas)

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
json.dump(json_file, open(f"output/{object_name}/animation.json", "w"), indent=4, ensure_ascii=False)
