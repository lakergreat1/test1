let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const recordButton = document.getElementById('recordButton');
const micIcon = document.getElementById('micIcon');
const recordText = document.getElementById('recordText');
const transcriptionArea = document.getElementById('transcriptionArea');
const occurrenceTypeSelect = document.getElementById('occurrenceType');
const reportTypeSelect = document.getElementById('reportType');
const generateReportButton = document.getElementById('generateReportButton');
const reportOutput = document.getElementById('reportOutput');
const reportContent = document.getElementById('reportContent');
const loadingSpinner = document.getElementById('loadingSpinner');
const editInstructions = document.getElementById('editInstructions');
const sendEditButton = document.getElementById('sendEditButton');
const editLoadingSpinner = document.getElementById('editLoadingSpinner');
const downloadPdfButton = document.getElementById('downloadPdfButton');
const downloadWordButton = document.getElementById('downloadWordButton');
const audioFileUpload = document.getElementById('audioFileUpload');

recordButton.addEventListener('click', toggleRecording);
generateReportButton.addEventListener('click', generateReport);
sendEditButton.addEventListener('click', sendEditInstructions);
downloadPdfButton.addEventListener('click', () => downloadReport('pdf'));
downloadWordButton.addEventListener('click', () => downloadReport('docx'));
audioFileUpload.addEventListener('change', handleFileUpload);

async function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            sendAudioForTranscription();
        };
        
        mediaRecorder.start();
        isRecording = true;
        updateUI();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Error accessing microphone. Please check your permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        updateUI();
    }
}

async function sendAudioForTranscription(file = null) {
    let audioBlob;
    if (file) {
        audioBlob = file;
    } else {
        audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        audioChunks = []; // Clear the chunks after creating the blob
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    
    showLoading();
    try {
        const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            appendTranscription(data.transcription);
        } else {
            throw new Error('Transcription failed');
        }
    } catch (error) {
        console.error('Error sending audio for transcription:', error);
        alert('Error transcribing audio. Please try again.');
    } finally {
        hideLoading();
    }
}

function appendTranscription(text) {
    transcriptionArea.value += (transcriptionArea.value ? '\n' : '') + text;
}

function updateUI() {
    if (isRecording) {
        micIcon.textContent = '🔴';
        recordText.textContent = 'Stop Recording';
        recordButton.classList.add('btn-error');
        recordButton.classList.remove('btn-primary');
    } else {
        micIcon.textContent = '🎙️';
        recordText.textContent = 'Start Recording';
        recordButton.classList.add('btn-primary');
        recordButton.classList.remove('btn-error');
    }
}

async function generateReport() {
    const occurrenceType = occurrenceTypeSelect.value;
    const reportType = reportTypeSelect.value;
    const transcription = transcriptionArea.value;

    if (!occurrenceType || !reportType || !transcription) {
        alert('Please select occurrence type, report type, and provide transcription.');
        return;
    }

    const formData = new FormData();
    formData.append('occurrence_type', occurrenceType);
    formData.append('report_type', reportType);
    formData.append('transcription', transcription);

    showLoading();
    try {
        const response = await fetch('/generate_report', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            displayReport(data.report);
        } else {
            throw new Error('Report generation failed');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayReport(report) {
    const formattedReport = formatReport(report);
    reportContent.value = formattedReport;
    reportOutput.classList.remove('hidden');
}

function formatReport(report) {
    let formattedReport = '';
    const topLevelFields = ['officer_full_name_and_badge_number', 'occurrence_number', 'occurrence_type', 'report_time', 'occurrence_time'];
    
    // Process top-level fields without empty lines
    for (const field of topLevelFields) {
        if (field in report) {
            formattedReport += `${field.replace(/_/g, ' ')}: ${report[field]}\n`;
        }
    }
    
    formattedReport += '\n'; // Add a single empty line after top-level fields
    
    // Process remaining fields
    for (const [key, value] of Object.entries(report)) {
        if (!topLevelFields.includes(key)) {
            if (typeof value === 'object' && value !== null) {
                formattedReport += `${key.replace(/_/g, ' ').toUpperCase()}:\n`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    formattedReport += `  ${subKey.replace(/_/g, ' ')}: ${subValue}\n`;
                }
            } else {
                formattedReport += `${key.replace(/_/g, ' ')}: ${value}\n`;
            }
            formattedReport += '\n';
        }
    }
    return formattedReport.trim();
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    generateReportButton.disabled = true;
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    generateReportButton.disabled = false;
}

async function sendEditInstructions() {
    const instructions = editInstructions.value.trim();
    if (!instructions) {
        alert('Please enter edit instructions.');
        return;
    }

    const currentReport = reportContent.value;
    const reportType = reportTypeSelect.value;
    const formData = new FormData();
    formData.append('report', currentReport);
    formData.append('instructions', instructions);
    formData.append('report_type', reportType);

    showEditLoading();
    try {
        const response = await fetch('/edit_report', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            displayReport(data.edited_report);
            editInstructions.value = ''; // Clear the input box
        } else {
            throw new Error('Report editing failed');
        }
    } catch (error) {
        console.error('Error editing report:', error);
        alert('Error editing report. Please try again.');
    } finally {
        hideEditLoading();
    }
}

function showEditLoading() {
    editLoadingSpinner.classList.remove('hidden');
    sendEditButton.disabled = true;
}

function hideEditLoading() {
    editLoadingSpinner.classList.add('hidden');
    sendEditButton.disabled = false;
}

async function downloadReport(format) {
    const reportType = reportTypeSelect.value;
    const reportContent = document.getElementById('reportContent').value;

    const formData = new FormData();
    formData.append('report_content', reportContent);
    formData.append('report_type', reportType);
    formData.append('format', format);

    try {
        const response = await fetch('/download_report', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `report.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            throw new Error('Report download failed');
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error downloading report. Please try again.');
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'audio/mpeg') {
        if (file.size > 25 * 1024 * 1024) {
            alert('File size exceeds 25MB limit. Please choose a smaller file.');
            event.target.value = ''; // Clear the file input
            return;
        }
        await sendAudioForTranscription(file);
    } else {
        alert('Please select a valid MP3 file.');
        event.target.value = ''; // Clear the file input
    }
}
