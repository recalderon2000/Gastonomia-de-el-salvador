// ============================================
// ELEMENTOS DEL DOM
// ============================================

const elementos = {
  hamburger: document.getElementById('hamburger'),
  navMenu: document.getElementById('navMenu'),
  form: document.getElementById('formCotizacion'),
  mensajeExito: document.getElementById('mensajeExito'),
  charCount: document.getElementById('charCount'),
  comentarios: document.getElementById('comentarios'),
  inputs: {
    nombre: document.getElementById('nombre'),
    email: document.getElementById('email'),
    telefono: document.getElementById('telefono'),
    destino: document.getElementById('destino'), // Representa el plato seleccionado
    personas: document.getElementById('personas'),
    fechaSalida: document.getElementById('fechaSalida'),
    fechaRegreso: document.getElementById('fechaRegreso'),
  },
};

// ============================================
// CLASE GESTORA DE PEDIDOS Y BANQUETES
// ============================================

class GestorPedidos {
  constructor() {
    this.pedidos = this.cargarLocalStorage();
    this.inicializar();
  }

  inicializar() {
    this.configurarMenu();
    this.configurarScroll();
    this.configurarFormulario();
    this.configurarContador();
    this.establecerFechaMinima();
  }

  // === MENÚ HAMBURGUESA INTERACCIÓN ===
  configurarMenu() {
    elementos.hamburger?.addEventListener('click', () => {
      elementos.navMenu?.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach((link) => {
      link.addEventListener('click', () => {
        elementos.navMenu?.classList.remove('active');
      });
    });
  }

  // === SCROLL SUAVE ===
  configurarScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
          window.scrollTo({
            top: target.offsetTop - navHeight,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  // === GESTIÓN DE FORMULARIO ===
  configurarFormulario() {
    // Validación en tiempo real (Blur e Input)
    Object.values(elementos.inputs).forEach((input) => {
      input?.addEventListener('blur', () => this.validarCampo(input));
      input?.addEventListener('input', () => this.limpiarError(input));
    });

    // Evento Submit
    elementos.form?.addEventListener('submit', (e) => this.enviarFormulario(e));
  }

  configurarContador() {
    elementos.comentarios?.addEventListener('input', (e) => {
      elementos.charCount.textContent = e.target.value.length;
    });
  }

  establecerFechaMinima() {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const fechaMin = manana.toISOString().split('T')[0];

    elementos.inputs.fechaSalida?.setAttribute('min', fechaMin);
    elementos.inputs.fechaRegreso?.setAttribute('min', fechaMin);
  }

  // === VALIDACIONES ESPECÍFICAS ===
  validarCampo(input) {
    const valor = input.value.trim();
    const id = input.id;

    switch (id) {
      case 'nombre':
        return this.validarNombre(input, valor);
      case 'email':
        return this.validarEmail(input, valor);
      case 'telefono':
        return this.validarTelefono(input, valor);
      case 'destino':
      case 'personas':
        return this.validarSeleccion(input, valor);
      case 'fechaSalida':
        return this.validarFechaEntrega(input, valor);
      case 'fechaRegreso':
        return this.validarFechaLimite(input, valor);
      default:
        return true;
    }
  }

  validarNombre(input, valor) {
    if (!valor) {
      this.mostrarError(input, 'El nombre es requerido');
      return false;
    }
    if (valor.length < 3) {
      this.mostrarError(input, 'Ingresa al menos 3 caracteres');
      return false;
    }
    if (!/^[a-záéíóúñ\s]+$/i.test(valor)) {
      this.mostrarError(input, 'Solo se permiten letras y espacios');
      return false;
    }
    this.limpiarError(input);
    return true;
  }

  validarEmail(input, valor) {
    if (!valor) {
      this.mostrarError(input, 'El correo electrónico es obligatorio');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      this.mostrarError(input, 'Estructura de correo inválida');
      return false;
    }
    this.limpiarError(input);
    return true;
  }

  validarTelefono(input, valor) {
    if (!valor) {
      this.mostrarError(input, 'El teléfono es obligatorio');
      return false;
    }
    // Remueve guiones para testear los 8 números limpios de El Salvador
    const telefonoLimpio = valor.replace(/-/g, '');
    // Permite números locales fijos tradicionales (2) o móviles (6, 7) de 8 dígitos totales
    if (!/^[267]\d{7}$/.test(telefonoLimpio)) {
      this.mostrarError(input, 'Formato requerido: 7XXX-XXXX o 2XXX-XXXX');
      return false;
    }
    this.limpiarError(input);
    return true;
  }

  validarSeleccion(input, valor) {
    if (!valor) {
      this.mostrarError(input, 'Por favor, selecciona una opción');
      return false;
    }
    this.limpiarError(input);
    return true;
  }

  validarFechaEntrega(input, valor) {
    if (!valor) {
      this.mostrarError(input, 'La fecha de entrega es obligatoria');
      return false;
    }

    const fechaEntrega = new Date(valor + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaEntrega <= hoy) {
      this.mostrarError(input, 'La fecha debe ser al menos el día de mañana');
      return false;
    }

    this.limpiarError(input);
    return true;
  }

  validarFechaLimite(input, valor) {
    if (!valor) {
      this.mostrarError(input, 'La fecha límite de cambios es obligatoria');
      return false;
    }

    const fechaLimite = new Date(valor + 'T00:00:00');
    const fechaEntrega = new Date(elementos.inputs.fechaSalida.value + 'T00:00:00');

    if (fechaLimite > fechaEntrega) {
      this.mostrarError(input, 'La fecha límite no puede ser posterior a la entrega');
      return false;
    }

    this.limpiarError(input);
    return true;
  }

  mostrarError(input, mensaje) {
    const grupo = input.closest('.form-group');
    grupo.classList.add('error');
    const errorSpan = grupo.querySelector('.error');
    if (errorSpan) errorSpan.textContent = mensaje;
  }

  limpiarError(input) {
    const grupo = input.closest('.form-group');
    grupo.classList.remove('error');
  }

  // === ENVÍO Y ALMACENAMIENTO ===
  enviarFormulario(e) {
    e.preventDefault();

    // Comprobar la validez de cada campo de entrada
    const valido = Object.values(elementos.inputs).every((input) =>
      this.validarCampo(input),
    );

    if (!valido) {
      const primerError = document.querySelector('.form-group.error');
      primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Instanciar el objeto del pedido gastronómico
    const pedido = {
      id: Date.now(),
      nombre: elementos.inputs.nombre.value.trim(),
      email: elementos.inputs.email.value.trim(),
      telefono: elementos.inputs.telefono.value.trim(),
      especialidad: elementos.inputs.destino.value,
      volumenPersonas: elementos.inputs.personas.value,
      fechaEntrega: elementos.inputs.fechaSalida.value,
      fechaLimiteCambios: elementos.inputs.fechaRegreso.value,
      detalles: elementos.comentarios.value.trim(),
      fechaRegistro: new Date().toISOString(),
    };

    // Almacenar en memoria y persistir
    this.pedidos.push(pedido);
    this.guardarLocalStorage();

    console.log('¡Pedido guardado exitosamente!', pedido);

    // Renderizar feedback visual
    this.mostrarExito();

    // Limpieza suave del formulario
    setTimeout(() => {
      elementos.form.reset();
      elementos.charCount.textContent = '0';
    }, 500);
  }

  mostrarExito() {
    elementos.mensajeExito.style.display = 'block';

    setTimeout(() => {
      elementos.mensajeExito.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);

    setTimeout(() => {
      elementos.mensajeExito.style.display = 'none';
    }, 6000);
  }

  // === PERSISTENCIA LOCAL STORAGE ===
  cargarLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('pedidosSaborCuscatleco')) || [];
    } catch {
      return [];
    }
  }

  guardarLocalStorage() {
    try {
      localStorage.setItem('pedidosSaborCuscatleco', JSON.stringify(this.pedidos));
    } catch (error) {
      console.error('Error al guardar datos en el almacenamiento local:', error);
    }
  }

  // MÉTODOS DE CONTROL ACCESIBLES DESDE CONSOLA (Para Debugging)
  obtenerPedidos() {
    return [...this.pedidos];
  }

  limpiarPedidos() {
    this.pedidos = [];
    this.guardarLocalStorage();
    console.log('Todos los pedidos del sistema han sido removidos.');
  }
}

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const gestor = new GestorPedidos();
  window.gestor = gestor; // Vinculación al entorno global para testeo

  console.log('✅ Sistema Gastronómico "Sabor Cuscatleco" inicializado con éxito.');
  console.log('📋 Digita: gestor.obtenerPedidos() en esta consola para examinar las solicitudes.');
});