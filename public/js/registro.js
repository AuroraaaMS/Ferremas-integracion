document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistro');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const pass1 = document.getElementById('contraseña').value;
      const pass2 = document.getElementById('confirmar_contraseña').value;
      if (pass1 !== pass2) {
        alert('Las contraseñas no coinciden');
        return;
      }
  
      const data = {
        nombre: document.getElementById('nombre').value,
        pass: pass1,
        rut: document.getElementById('rut').value,
        correo: document.getElementById('correo').value
      };
  
      try {

        const response = await fetch('/api/cliente', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text);
        }
        alert(text);

        window.location.href = '/login.html';
  
      } catch (error) {
        console.error('Error al registrar cliente:', error);
        alert('Error: ' + error.message);
      }
    });
  });
  