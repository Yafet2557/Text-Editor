from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# Route for home page
@app.route('/')
def index():
    # Render html page
    return render_template('index.html')

# Route for loading file content
@app.route('/load_file', methods=['POST'])
def load_file():
    
    # Get the file name from the form data in the POST request
    file_name = request.form.get('file_name')
    # Get absolute path to file
    file_path = os.path.join(os.getcwd(), file_name)
   
    print("File path:", file_path)
    try:
        # Open file for reading
        with open(file_path, 'r') as file:
            # Read file
            content = file.read()
            # Return as JSON response
            return jsonify({'content': content})
    except FileNotFoundError:
        # If file is not found
        return jsonify({'error': 'File not found'})
    
if __name__ == '__main__':
    app.run(debug=True)