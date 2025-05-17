let productoSeleccionadoId = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosBodega();
    configurarEventos();
});

function configurarEventos() {
    document.getElementById('form-producto').addEventListener('submit', manejarFormulario);
    document.getElementById('btn-limpiar').addEventListener('click', limpiarFormulario);
    document.getElementById('confirmDeleteBtn').addEventListener('click', eliminarProductoConfirmado);
}

async function cargarProductosBodega() {
    try {
        const response = await fetch('/api/productos/bodega');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        mostrarError(error.message);
    }
}

function mostrarProductos(productos) {
    const tbody = document.querySelector('#tabla-inventario tbody');
    tbody.innerHTML = '';

    productos.forEach(producto => {
        const row = `
            <tr>
                <td>${producto.id_producto}</td>
                <td>${producto.Nombre}</td>
                <td>${producto.descripcion}</td>
                <td>${producto.marca}</td>
                <td>${producto.precio}</td>
                <td>${producto.total_stock}</td>
                <td>
                    <button class="btn btn-warning btn-sm btn-editar" data-id="${producto.id_producto}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-eliminar" data-id="${producto.id_producto}">Eliminar</button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => editarProducto(btn.dataset.id));
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', () => confirmarEliminacion(btn.dataset.id));
    });
}

async function manejarFormulario(e) {
    e.preventDefault();
    const producto = {
        Nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        marca: document.getElementById('marca').value,
        precio: document.getElementById('precio').value
    };

    try {
        const metodo = productoSeleccionadoId ? 'PUT' : 'POST';
        const url = productoSeleccionadoId ? `/api/productos/bodega/${productoSeleccionadoId}` : '/api/productos/bodega';
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });
        if (!response.ok) throw new Error('Error al guardar');
        mostrarExito(productoSeleccionadoId ? 'Producto actualizado' : 'Producto creado');
        limpiarFormulario();
        cargarProductosBodega();
    } catch (error) {
        mostrarError(error.message);
    }
}

async function editarProducto(id) {
    try {
        const response = await fetch(`/api/productos/bodega/${id}`);
        if (!response.ok) throw new Error('Error al cargar producto');
        const producto = await response.json();
        productoSeleccionadoId = producto.id_producto;
        document.getElementById('nombre').value = producto.Nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('marca').value = producto.marca;
        document.getElementById('precio').value = producto.precio;
    } catch (error) {
        mostrarError(error.message);
    }
}

function confirmarEliminacion(id) {
    productoSeleccionadoId = id;
    new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
}

async function eliminarProductoConfirmado() {
    if (!productoSeleccionadoId) return;
    try {
        const response = await fetch(`/api/productos/bodega/${productoSeleccionadoId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');
        mostrarExito('Producto eliminado');
        cargarProductosBodega();
        bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
    } catch (error) {
        mostrarError(error.message);
    }
}

function limpiarFormulario() {
    document.getElementById('form-producto').reset();
    productoSeleccionadoId = null;
}

function mostrarExito(mensaje) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = mensaje;
    toastEl.classList.remove('bg-danger', 'bg-warning');
    toastEl.classList.add('bg-success');
    new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 }).show();
}

function mostrarError(mensaje) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = mensaje;
    toastEl.classList.remove('bg-success', 'bg-warning');
    toastEl.classList.add('bg-danger');
    new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 }).show();
}