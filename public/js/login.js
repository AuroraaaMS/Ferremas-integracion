function iniciarSesion(event) {
    event.preventDefault(); 
  
    const correo = document.getElementById('correo').value;
    const pass = document.getElementById('pass').value;
    const rol = Number(document.getElementById('tipo-usuario').value);

  
    const data = { correo, pass , rol };
  
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Correo o contraseña incorrectos');
        }
        return response.json();
      })
      .then((data) => {
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      })
      .catch((error) => {
        console.error('Error al realizar el login:', error);
        alert(error.message);
      });
  }
  
  const swiper = new Swiper(".mySwiper", {
    direction: "vertical",
    loop: true,
    speed: 1000,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    mousewheel: true,
  });
  
  