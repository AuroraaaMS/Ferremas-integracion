-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema ferramas
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ferramas
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ferramas` ;
USE `ferramas` ;

-- -----------------------------------------------------
-- Table `ferramas`.`Rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Rol` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `pass` VARCHAR(45) NOT NULL,
  `rut` VARCHAR(45) NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `Rol_id` INT NOT NULL,
  PRIMARY KEY (`id_usuario`, `Rol_id`),
  INDEX `fk_Usuario_Rol_idx` (`Rol_id` ASC) VISIBLE,
  CONSTRAINT `fk_Usuario_Rol`
    FOREIGN KEY (`Rol_id`)
    REFERENCES `ferramas`.`Rol` (`id_rol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Categoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Categoria` (
  `id_categoria` INT NOT NULL,
  `nombre_categoria` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_categoria`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Producto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Producto` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(85) NOT NULL,
  `descripcion` VARCHAR(250) NOT NULL,
  `marca` VARCHAR(45) NOT NULL,
  `precio` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  PRIMARY KEY (`id_producto`, `id_categoria`),
  INDEX `fk_Producto_Categoria1_idx` (`id_categoria` ASC) VISIBLE,
  CONSTRAINT `fk_Producto_Categoria1`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `ferramas`.`Categoria` (`id_categoria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Sucursal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Sucursal` (
  `id_sucursal` INT NOT NULL,
  `nombre_sucursal` VARCHAR(45) NOT NULL,
  `direccion_sucursal` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id_sucursal`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Stock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Stock` (
  `id_stock` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `id_sucursal` INT NOT NULL,
  `id_producto` INT NOT NULL,
  PRIMARY KEY (`id_stock`, `id_sucursal`, `id_producto`),
  INDEX `fk_Stock_Sucursal1_idx` (`id_sucursal` ASC) VISIBLE,
  INDEX `fk_Stock_Producto1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_Stock_Sucursal1`
    FOREIGN KEY (`id_sucursal`)
    REFERENCES `ferramas`.`Sucursal` (`id_sucursal`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Stock_Producto1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `ferramas`.`Producto` (`id_producto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Carrito`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Carrito` (
  `id_carrito` INT NOT NULL,
  `fecha_creacion` VARCHAR(45) NOT NULL,
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_carrito`, `id_usuario`),
  INDEX `fk_Carrito_Usuario1_idx` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_Carrito_Usuario1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `ferramas`.`Usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Carrito_item`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Carrito_item` (
  `id_item` INT NOT NULL,
  `id_carrito` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`id_item`, `id_carrito`, `id_producto`),
  INDEX `fk_Carrito_item_Carrito1_idx` (`id_carrito` ASC) VISIBLE,
  INDEX `fk_Carrito_item_Producto1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_Carrito_item_Carrito1`
    FOREIGN KEY (`id_carrito`)
    REFERENCES `ferramas`.`Carrito` (`id_carrito`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Carrito_item_Producto1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `ferramas`.`Producto` (`id_producto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Pedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Pedido` (
  `id_pedido` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `fecha_pedido` DATE NOT NULL,
  `metodo_entrega` VARCHAR(45) NOT NULL,
  `direccion_entrega` VARCHAR(45) NOT NULL,
  `tipo_documento` VARCHAR(45) NOT NULL,
  `estado` VARCHAR(45) NOT NULL,
  `total` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_pedido`, `id_usuario`),
  INDEX `fk_Pedido_Usuario1_idx` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_Pedido_Usuario1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `ferramas`.`Usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Pedido_Detalle`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Pedido_Detalle` (
  `id_pedido_detalle` INT NOT NULL,
  `id_pedido` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` INT NOT NULL,
  PRIMARY KEY (`id_pedido_detalle`, `id_pedido`, `id_producto`),
  INDEX `fk_Pedido_Detalle_Pedido1_idx` (`id_pedido` ASC) VISIBLE,
  INDEX `fk_Pedido_Detalle_Producto1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_Pedido_Detalle_Pedido1`
    FOREIGN KEY (`id_pedido`)
    REFERENCES `ferramas`.`Pedido` (`id_pedido`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Pedido_Detalle_Producto1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `ferramas`.`Producto` (`id_producto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Pago`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Pago` (
  `id_pago` INT NOT NULL,
  `id_pedido` INT NOT NULL,
  `metodo_pago` VARCHAR(45) NOT NULL,
  `comprobante` VARCHAR(45) NOT NULL,
  `confirmado` TINYINT NOT NULL,
  `fecha_pago` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_pago`, `id_pedido`),
  INDEX `fk_Pago_Pedido1_idx` (`id_pedido` ASC) VISIBLE,
  CONSTRAINT `fk_Pago_Pedido1`
    FOREIGN KEY (`id_pedido`)
    REFERENCES `ferramas`.`Pedido` (`id_pedido`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ferramas`.`Reclamo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ferramas`.`Reclamo` (
  `id_reclamo` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_pedido` INT NOT NULL,
  `descripcion_reclamo` VARCHAR(400) NOT NULL,
  `fecha` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_reclamo`, `id_usuario`, `id_pedido`),
  INDEX `fk_Reclamo_Usuario1_idx` (`id_usuario` ASC) VISIBLE,
  INDEX `fk_Reclamo_Pedido1_idx` (`id_pedido` ASC) VISIBLE,
  CONSTRAINT `fk_Reclamo_Usuario1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `ferramas`.`Usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Reclamo_Pedido1`
    FOREIGN KEY (`id_pedido`)
    REFERENCES `ferramas`.`Pedido` (`id_pedido`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
