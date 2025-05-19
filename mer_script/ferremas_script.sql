USE `ferremas`;

DROP TABLE IF EXISTS Pago;
DROP TABLE IF EXISTS Pedido_Detalle;
DROP TABLE IF EXISTS Reclamo;
DROP TABLE IF EXISTS Carrito_item;
DROP TABLE IF EXISTS Carrito;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Stock;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Categoria;
DROP TABLE IF EXISTS Sucursal;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Rol;






CREATE TABLE `Rol` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_rol`)
);

CREATE TABLE `Usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `pass` VARCHAR(45) NOT NULL,
  `rut` VARCHAR(12) NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `Rol_id` INT NOT NULL,
  PRIMARY KEY (`id_usuario`),
  FOREIGN KEY (`Rol_id`) REFERENCES `Rol` (`id_rol`)
);


CREATE TABLE `Categoria` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre_categoria` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_categoria`)
);

CREATE TABLE `Producto` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(85) NOT NULL,
  `descripcion` VARCHAR(250) NOT NULL,
  `marca` VARCHAR(45) NOT NULL,
  `precio` INT NOT NULL,  -- Usado INT para precios
  `id_categoria` INT NOT NULL,
  PRIMARY KEY (`id_producto`),
  FOREIGN KEY (`id_categoria`) REFERENCES `Categoria` (`id_categoria`)
);
DESCRIBE Producto;


CREATE TABLE `Sucursal` (
  `id_sucursal` INT NOT NULL AUTO_INCREMENT,
  `nombre_sucursal` VARCHAR(45) NOT NULL,
  `direccion_sucursal` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id_sucursal`)
);

CREATE TABLE `Stock` (
  `id_stock` INT NOT NULL AUTO_INCREMENT,
  `cantidad` INT NOT NULL,
  `id_sucursal` INT NOT NULL,
  `id_producto` INT NOT NULL,
  PRIMARY KEY (`id_stock`),
  FOREIGN KEY (`id_sucursal`) REFERENCES `Sucursal` (`id_sucursal`),
  FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`)
);

CREATE TABLE `Carrito` (
  `id_carrito` INT NOT NULL AUTO_INCREMENT,
  `fecha_creacion` DATETIME NOT NULL,  -- Usado DATETIME para fecha y hora
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_carrito`),
  FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
);

CREATE TABLE `Carrito_item` (
  `id_item` INT NOT NULL AUTO_INCREMENT,
  `id_carrito` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`id_item`),
  FOREIGN KEY (`id_carrito`) REFERENCES `Carrito` (`id_carrito`),
  FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`)
);

CREATE TABLE `Pedido` (
  `id_pedido` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `fecha_pedido` DATETIME NOT NULL,  -- Usado DATETIME para fecha y hora
  `metodo_entrega` VARCHAR(45) NOT NULL,
  `direccion_entrega` VARCHAR(150) NOT NULL,
  `tipo_documento` VARCHAR(45) NOT NULL,
  `estado` VARCHAR(45) NOT NULL,
  `total` INT NOT NULL,  -- Usado INT para precios
  PRIMARY KEY (`id_pedido`),
  FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
);

CREATE TABLE `Pedido_Detalle` (
  `id_pedido_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_pedido` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` INT NOT NULL,  -- Usado INT para precios
  PRIMARY KEY (`id_pedido_detalle`),
  FOREIGN KEY (`id_pedido`) REFERENCES `Pedido` (`id_pedido`),
  FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`)
);

CREATE TABLE `Pago` (
  `id_pago` INT NOT NULL AUTO_INCREMENT,
  `id_pedido` INT NOT NULL,
  `metodo_pago` VARCHAR(45) NOT NULL,
  `comprobante` VARCHAR(45) NOT NULL,
  `confirmado` TINYINT NOT NULL,
  `fecha_pago` DATETIME NOT NULL,  -- Usado DATETIME para fecha y hora
  PRIMARY KEY (`id_pago`),
  FOREIGN KEY (`id_pedido`) REFERENCES `Pedido` (`id_pedido`)
);

CREATE TABLE `Reclamo` (
  `id_reclamo` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_pedido` INT NOT NULL,
  `descripcion_reclamo` VARCHAR(400) NOT NULL,
  `fecha` DATETIME NOT NULL,  -- Usado DATETIME para fecha y hora
  PRIMARY KEY (`id_reclamo`),
  FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`),
  FOREIGN KEY (`id_pedido`) REFERENCES `Pedido` (`id_pedido`)
);

USE `ferremas`;


INSERT INTO Categoria (nombre_categoria)
VALUES 
('Herramientas Eléctricas'),
('Materiales de Construcción'),
('Pinturas y Adhesivos'),
('Fontanería'),
('Electricidad'),
('Ferretería General');


INSERT INTO Producto (Nombre, descripcion, marca, precio, id_categoria)
VALUES
('Taladro Percutor 600W', 'Taladro percutor eléctrico para concreto y madera', 'Bosch', 54990, 1),
('Sierra Circular 7"', 'Sierra eléctrica de alto rendimiento', 'Makita', 89990, 1),
('Cemento Portland 25kg', 'Saco de cemento de alta resistencia', 'Melón', 5990, 2),
('Plancha OSB 11mm', 'Plancha estructural para techos y paredes', 'Arauco', 13990, 2),
('Pintura Látex Interior 1 galón', 'Pintura blanca para muros interiores', 'Sipa', 12990, 3),
('Silicona Transparente 280ml', 'Sellador de alta adherencia', 'Pattex', 2990, 3),
('Codo PVC 90° 50mm', 'Codo para instalaciones de agua potable', 'Tigre', 890, 4),
('Llave monomando lavaplatos', 'Grifería cromada para cocina', 'Stretto', 23990, 4),
('Interruptor doble blanco', 'Interruptor para instalación eléctrica interior', 'BTicino', 1990, 5),
('Cable eléctrico 2x1.5mm 100m', 'Cable de cobre forrado, uso residencial', 'Cademsa', 34990, 5),
('Martillo carpintero 16oz', 'Martillo de acero con mango de goma', 'Truper', 4990, 6),
('Destornillador Phillips mediano', 'Destornillador punta cruz', 'Pretul', 1990, 6);




INSERT INTO Rol (nombre_rol)
VALUES 
('Cliente'),
('Vendedor'),
('Bodeguero'),
('Administrador'),
('Contador');


INSERT INTO Usuario (nombre, pass, rut, correo, Rol_id)
VALUES 
('Juan Pérez', '1234', '12345678-9', 'juan@example.com', 1),
('María Soto', '1234', '87654321-0', 'maria@example.com', 2),
('Pedro Rojas', '1234', '11222333-4', 'pedro@example.com', 3),
('Ana Torres', '1234', '99887766-5', 'ana@example.com', 4),
('Javier Gutiérrez', '1234', '16678903-2', 'javier@example.com', 5);


INSERT INTO Sucursal (nombre_sucursal, direccion_sucursal)
VALUES ('Sucursal Centro', 'Ruta Calle 1');

INSERT INTO Sucursal (nombre_sucursal, direccion_sucursal)
VALUES ('Sucursal Norte', 'Ruta Calle 2');

INSERT INTO Sucursal (nombre_sucursal, direccion_sucursal)
VALUES ('Sucursal Sur', 'Ruta Calle 3');

INSERT INTO Sucursal (nombre_sucursal, direccion_sucursal)
VALUES ('Sucursal Este', 'Ruta Calle 4');

INSERT INTO Sucursal (nombre_sucursal, direccion_sucursal)
VALUES ('Sucursal Oeste', 'Ruta Calle 5');


INSERT INTO Stock (cantidad, id_sucursal, id_producto)
VALUES 
(20, 1, 1),
(15, 1, 2),
(50, 2, 3),
(30, 2, 4),
(25, 3, 5),
(40, 3, 6),
(10, 4, 7),
(5, 4, 8),
(35, 5, 9),
(45, 5, 10),
(12, 1, 11),
(18, 2, 12);

INSERT INTO Carrito (fecha_creacion, id_usuario)
VALUES 
(NOW(), 1),
(NOW(), 3);