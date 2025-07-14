document.addEventListener('DOMContentLoaded', function () {
    const itemForm = document.getElementById('itemForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    itemForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(itemForm);

        fetch('/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageText.textContent = 'Item added successfully!';
                messageBox.classList.remove('hidden');
                itemForm.reset();
                // You can optionally reload the closet items here
            } else {
                messageText.textContent = 'Error adding item: ' + data.error;
                messageBox.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageText.textContent = 'An unexpected error occurred.';
            messageBox.classList.remove('hidden');
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
