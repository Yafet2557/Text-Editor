/**
 * Document Ready Event Listener
 * This event listener is triggered when the DOM content is fully loaded.
 * It initializes references to HTML elements, sets initial states,
 * and attaches event listeners for file input, dropdown, and buttons.
 */
document.addEventListener("DOMContentLoaded", initializeTextEditor);

/**
 * Function to initialize the text editor when the DOM is ready.
 */
function initializeTextEditor() {
    const fileInput = document.getElementById('fileInput');
    const errorMessage = document.getElementById('ErrorMessage');
    const editorTextArea = document.getElementById('editorTextArea');
    const charCount = document.getElementById('CharCount');
    const fileDropdown = document.getElementById('fileDropdown');
    const saveButton = document.getElementById('SaveButton');
    const saveAsButton = document.getElementById('SaveAsButton');
    const new_file = document.getElementById('new_file');
    const saveAsConfirm = document.getElementById('SaveAsConfirm');

    setInitialStates();

    fileInput.addEventListener('change', handleFileSelection);

    fileDropdown.addEventListener('change', handleDropdownChange);

    editorTextArea.addEventListener('input', handleEditorInput);

    saveButton.addEventListener('click', handleSaveButtonClick);

    saveAsButton.addEventListener('click', handleSaveAsButtonClick);

    saveAsConfirm.addEventListener('click', handleSaveAsConfirmClick);

    /**
     * Function to set initial states of buttons and fields.
     */
    function setInitialStates() {
        // Disable buttons and fields to start with
        saveButton.disabled = true;
        saveAsButton.disabled = true;
        new_file.hidden = true;
        saveAsConfirm.disabled = true;
    }

    /**
     * Event Handler for Dropdown Change
     * Loads and displays the content of the selected file from the dropdown.
     */
    function handleDropdownChange() {
        const file = fileDropdown.value;
        loadFileContent(file);
    }

    /**
     * Event Handler for Editor Text Area Input
     * Updates the character count and enables save buttons when the content changes.
     */
    function handleEditorInput() {
        charCount.textContent = editorTextArea.value.length;
        saveButton.disabled = false;
        saveAsButton.disabled = false;
    }

    /**
     * Event Handler for Save Button
     * Saves the content of the editor to the selected file.
     */
    function handleSaveButtonClick() {
        const filename = fileDropdown.value;
        const content = editorTextArea.value;
        saveContent(filename, content);
    }

    /**
     * Event Handler for Save As Button
     * Displays the new file input and save confirmation button.
     */
    function handleSaveAsButtonClick() {
        new_file.hidden = false;
        saveAsConfirm.disabled = false;
    }

    /**
     * Event Handler for Save As Confirmation Button
     * Saves the content to the new file, adds it to the dropdown,
     * and handles UI states accordingly.
     */
    function handleSaveAsConfirmClick() {
        const newFileName = new_file.value;
        const content = editorTextArea.value;

        saveContent(newFileName, content);

        if (!fileExist(newFileName, fileDropdown)) {
            const option = document.createElement('option');
            option.text = newFileName;
            fileDropdown.add(option);
            option.selected = true;
            option.value = newFileName;
        } else {
            errorMessage.textContent = "File already exists in the dropdown.";
        }

        // Reset and hide the new file input
        new_file.value = '';
        new_file.hidden = true;
        saveAsConfirm.disabled = true;
        saveAsButton.disabled = true;
    }

    /**
     * Function to make a POST request to load file content
     * @param {string} fileName - The name of the file to load.
     */
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

    /**
     * Function to make a POST request to save file content
     * @param {string} fileName - The name of the file to save.
     * @param {string} content - The content to be saved.
     */
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
                } else {
                    errorMessage.textContent = 'File saved successfully!!!';
                    saveButton.disabled = true;
                }
            });
    }

    /**
     * Function to handle file selection
     * Gets selected files, determines the file path, and adds it to the dropdown.
     */
    function handleFileSelection() {
        const selectedFile = fileInput.files[0];

        if (selectedFile) {
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
        } else {
            console.log("No file selected.");
        }
    }

    /**
     * Function to check if a file already exists in the dropdown
     * @param {string} filename - The name of the file to check.
     * @param {HTMLSelectElement} dropdown - The dropdown element.
     * @returns {boolean} - True if the file already exists, false otherwise.
     */
    function fileExist(filename, dropdown) {
        for (var i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].text === filename) {
                return true;
            }
        }
        return false;
    }
}
