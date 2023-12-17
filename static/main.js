document.addEventListener("DOMContentLoaded", function () {
    // Reference to html elements
    const fileInput = document.getElementById('fileInput');
    const errorMessage = document.getElementById('ErrorMessage');
    const editorTextArea = document.getElementById('editorTextArea');
    const charCount = document.getElementById('CharCount');
    const fileDropdown = document.getElementById('fileDropdown');



    // Event listener for file input, handling file selection
    fileInput.addEventListener('change', function () {
        // Get selected files
        const selectedFile = fileInput.files[0];

        if (selectedFile) {
            // Determine the file path to be sent to the server
            const filePath = selectedFile.webkitRelativePath || selectedFile.name;

            // Add selected file to drop down option
            const option = document.createElement('option');
            option.value = filePath;
            option.text = filePath;
            fileDropdown.add(option);
            // Call function to load file content
            loadFileContent(filePath);
        }
    });

    // Event listener to display file content of selected file from dropdown
    fileDropdown.addEventListener('change', function () {
        const file = fileDropdown.value;
        loadFileContent(file);

    });

    editorTextArea.addEventListener('input', function(){
        charCount.textContent = editorTextArea.value.length;
    });

    // Function to make a POST request to load file content
    function loadFileContent(fileName) {
        fetch('/load_file', {
            method: 'POST',
            body: new URLSearchParams({ 'file_name': fileName }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then(response => response.json())
            .then(data => {
                // Handle server response
                if (data.error) {
                    errorMessage.textContent = data.error;
                } else {
                    // Update the text area with the content of the selected file
                    editorTextArea.value = data.content;
                    charCount.textContent = editorTextArea.value.length;
                    errorMessage.textContent = '';
                }
            });
    }
});
