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
    // References to HTML elements
    const charCount = document.getElementById('CharCount');
    const fileDropdown = document.getElementById('fileDropdown');
    const saveButton = document.getElementById('SaveButton');
    const saveAsButton = document.getElementById('SaveAsButton');
    setInitialStates();
    const downloadButton = document.getElementById('DownloadButton');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

    // Event listeners
    fileDropdown.addEventListener('change', handleDropdownChange);
    editorTextArea.addEventListener('input', handleEditorInput);
    saveButton.addEventListener('click', handleSaveButtonClick);
    saveAsButton.addEventListener('click', handleSaveAsButtonClick);
    downloadButton.addEventListener('click', handleDownloadButtonClick);

    /**
     * Function to set initial states of buttons and fields.
     */
    function setInitialStates() {
        // Disable buttons and fields to start with
        saveButton.disabled = true;
        saveAsButton.disabled = true;
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
        var filename = fileDropdown.value.trim(); // Trim to remove leading/trailing spaces

        if (!filename) {
            filename = prompt('Enter a file name:').trim();
            if (!filename) {
                return; // User canceled or entered an empty string
            }
            addFileToDropdown(filename);
        }

        // Validate filename to prevent injection
        if (!isValidFilename(filename)) {
            DisplayError('Invalid filename. Please use alphanumeric characters and underscores.');
            return;
        }

        const content = editorTextArea.value;
        saveContent(filename, content);
    }

    /**
     * Event Handler for Save As Button
     * Displays the new file input and save confirmation button.
     */
    function handleSaveAsButtonClick() {
        var filename = prompt('Enter a new filename: ');
        const content = editorTextArea.value;

        if (filename) {
            addFileToDropdown(filename);
            saveContent(filename, content);
        }
    }

    /**
  * Event Handler for Download Button
  * Downloads the content of the editor as a text file.
  */
    function handleDownloadButtonClick() {
        // Get the content of the editor
        const editorContent = editorTextArea.value;

        // Check if the content is empty
        if (!editorContent) {
            // Display an alert if the content is empty
            DisplayError('Cannot download an empty file.');
            return;
        }

        // Create a Blob (binary large object) containing the content as a text file
        var textBlob = new Blob([editorContent], { type: 'text/plain' });

        // Create a temporary link element
        var downloadLink = document.createElement('a');

        // Set the link's href to a URL representing the Blob
        downloadLink.href = URL.createObjectURL(textBlob);

        // Get the filename from the file dropdown, or use 'untitled.txt' if not available
        var fileName = fileDropdown.value || 'untitled.txt';

        // Set the download attribute with the filename
        downloadLink.download = fileName;

        // Append the link to the document body
        document.body.appendChild(downloadLink);

        // Trigger a click event on the link, initiating the download
        downloadLink.click();

        // Remove the link from the document body
        document.body.removeChild(downloadLink);
    }



    /**
     * Function to add a new file to the dropdown if it doesn't already exist.
     * @param {string} fileName - The name of the file to add.
     */
    function addFileToDropdown(fileName) {
        // Check if the file already exists in the dropdown
        if (!fileExist(fileName, fileDropdown)) {
            const option = document.createElement('option');
            option.text = fileName;
            fileDropdown.add(option);
            option.selected = true;
            option.value = fileName;
        } else {
            // Optionally, you can provide feedback to the user that the file already exists.
            alert("File already exists in the dropdown.");
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
            .then(handleLoadResponse)
            .catch(handleError);
    }

    /**
     * Function to handle the response after loading file content
     * @param {Object} data - The response data.
     */
    function handleLoadResponse(data) {
        if (data.error) {
            DisplayError(data.error);
        } else {
            // Update the text area with the content of the selected file
            editorTextArea.value = data.content;
            charCount.textContent = editorTextArea.value.length;
        }
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
            .then(handleSaveResponse)
            .catch(handleError);
    }

    /**
     * Function to handle the response after saving file content
     * @param {Object} data - The response data.
     */
    function handleSaveResponse(data) {
        if (data.error) {
            DisplayError(data.error);
        } else {
            saveButton.disabled = true;
        }
    }

    /**
     * Function to handle errors
     * @param {Error} error - The error object.
     */
    function handleError(error) {
        DisplayError(error.message || 'An error occurred.');
    }

    /**
     * Function to display an error message in a modal.
     * @param {string} message - The error message to display.
     */
    function DisplayError(message) {
        const modalErrorMessage = document.getElementById('modalErrorMessage');
        modalErrorMessage.textContent = message;
        errorModal.show();
    }
}
