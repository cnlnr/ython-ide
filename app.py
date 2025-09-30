from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    selected_language = None
    if request.method == 'POST':
        # 获取用户输入的文本框值
        selected_language = request.form.get('language')
    return render_template('index.html', selected_language=selected_language)

if __name__ == '__main__':
    app.run(debug=True)
