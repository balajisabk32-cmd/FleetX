async function apiCall(url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (response.status === 204) return true;
        
        const data = await response.json();
        
        if (!response.ok) {
            let msg = data.message || 'An error occurred';
            if (data.errors && data.errors.length > 0) {
                msg += ': ' + data.errors.map(e => e.msg).join(', ');
            }
            showMessage(msg, 'danger');
            return null;
        }
        
        return data;
    } catch (error) {
        showMessage('Network error or server is down', 'danger');
        console.error(error);
        return null;
    }
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        msgDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                                ${msg}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
        
        setTimeout(() => {
            msgDiv.innerHTML = '';
        }, 5000);
    }
}
