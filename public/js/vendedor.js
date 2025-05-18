function cerrarSesion() {
    fetch('/logout').then(() => window.location.href = '/login.html');
  }