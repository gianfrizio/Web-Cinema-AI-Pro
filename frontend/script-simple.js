// Versione semplificata per debug
console.log('Script.js loaded');

// Test semplice per verificare se il file viene caricato
window.simpleTest = function() {
    alert('Simple test works!');
};

// Funzione di clear semplificata
window.simpleClear = function() {
    if (confirm('Clear all movies?')) {
        localStorage.removeItem('favoriteMovies');
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in simple script');
    
    // Aggiungi event listener semplice
    const clearBtn = document.getElementById('clearAll');
    if (clearBtn) {
        clearBtn.onclick = window.simpleClear;
        clearBtn.disabled = false;
        clearBtn.style.pointerEvents = 'auto';
        console.log('Clear button setup complete');
    }
});
