from flask import Flask, request, jsonify
import easyocr
import base64
import io
from PIL import Image

app = Flask(__name__)
reader = easyocr.Reader(['ch_sim', 'en'])  # 使用中文简体和英文

@app.route('/ocr', methods=['POST'])
def ocr():
    data = request.json
    image_data = data['image'].split(',')[1]  # 移除 "data:image/png;base64," 前缀
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # 保存图片到 screenshots 文件夹
    filename = data['filename']
    image.save(filename)
    
    # 执行 OCR
    result = reader.readtext(image)
    text = ' '.join([item[1] for item in result])
    
    # 保存 OCR 结果到 ocrresults 文件夹
    ocr_filename = filename.replace('screenshots', 'ocrresults').replace('.png', '.txt')
    with open(ocr_filename, 'w', encoding='utf-8') as f:
        f.write(text)
    
    return jsonify({'text': text})

if __name__ == '__main__':
    app.run(port=5000)