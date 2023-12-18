document.addEventListener("DOMContentLoaded", function () {
    // Reference to html elements
    const fileInput = document.getElementById('fileInput');
    const errorMessage = document.getElementById('ErrorMessage');
    const editorTextArea = document.getElementById('editorTextArea');
    const charCount = document.getElementById('CharCount');
    const fileDropdown = document.getElementById('fileDropdown');
    const saveButton = document.getElementById('SaveButton');
    const saveAsButton = document.getElementById('SaveAsButton');
    const new_file = document.getElementById('new_file');
    const SaveAsConfirm = document.getElementById('SaveAsConfirm');

  
    
    // Event listener for file input, handling file selection
    fileInput.addEventListener('change', handleFileSelection);
    

    // Event listener to display file content of selected file from dropdown
    fileDropdown.addEventListener('change', function () {
        const file = fileDropdown.value;
        loadFileContent(file);

    });

    // Event listener to update character count when changing
    editorTextArea.addEventListener('input', function () {
        charCount.textContent = editorTextArea.value.length;
        saveButton.disabled = false;
        saveAsButton.disabled = false;
    });

    saveButton.addEventListener('click', function () {
        const filename = fileDropdown.value;
        const content = editorTextArea.value;
        saveContent(filename, content);
    });

    saveAsButton.addEventListener('click', function () {
        new_file.hidden = false;
        SaveAsConfirm.disabled = false;
    });
    
    SaveAsConfirm.addEventListener('click', function(){
        const newFileName = new_file.value;
        const content = editorTextArea.value;
        saveContent(newFileName, content);

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


    function saveContent(fileName, content) {
        fetch('/save_file', {
            method: 'POST',
            body: new URLSearchParams({
                'file_name': fileName,
                'file_content': content,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    errorMessage.textContent = data.error;
                }
                else {
                    errorMessage.textContent = 'File saved successfully!!!';
                    saveButton.disabled = true;
                }
            })
    }

    function handleFileSelection() {
        // Get selected files
        const selectedFile = fileInput.files[0];
        console.log(selectedFile);
    
        if (selectedFile) {
            // Determine the file path to be sent to the server
            const filePath = selectedFile.webkitRelativePath || selectedFile.name;
    
            if (!fileExist(filePath, fileDropdown)) {
                const option = document.createElement('option');
                option.text = filePath;
                fileDropdown.add(option);
                option.selected = true;
                option.value = filePath;
    
                // Call function to load file content
                loadFileContent(filePath);
            } else {
                errorMessage.textContent = "File already exists in the dropdown.";
            }
        }
    }

    function fileExist(filename, dropdown) {
        for (var i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].text === filename) {
                return true;
            }
        }
        return false;
    }



    saveButton.disabled = true;
    saveAsButton.disabled = true;
    new_file.hidden = true;
    SaveAsConfirm.disabled = true;
});
