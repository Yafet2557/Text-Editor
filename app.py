from flask import Flask, render_template, request, jsonify
import os, logging

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
    except FileNotFoundError as e:
        logging.error(f'Error loading file: {str(e)}')
        return jsonify({'error': 'File not found'})
    
@app.route('/save_file', methods=['POST'])
def save_file():
    file_name = request.form.get('file_name') # Get the file name
    file_content = request.form.get('file_content') # And file content

    try:
        # Open file for writing
        with open(file_name, 'w') as file:
            # Write content to file
            file.write(file_content)
            # Return json response
            return jsonify({'success':True})
    except Exception as e:
        logging.error(f'Error saving file: {str(e)}')
        return jsonify({'error':f'Error saving file {str(e)}'})
    
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)