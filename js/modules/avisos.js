// ============================================================
// MOTOR DE AVISOS
// ARATECH-SYS
// ============================================================

window.AVISOS = {};

AVISOS.list = function (cliente_id) {
  const avisos = DB.get("cliente_avisos") || [];

  return avisos
    .filter((a) => a.cliente_id === cliente_id)
    .sort((a, b) => {
      const fa = `${a.fecha || ""} ${a.hora || ""}`;
      const fb = `${b.fecha || ""} ${b.hora || ""}`;
      return fb.localeCompare(fa);
    });
};

AVISOS.save = async function (data) {
  if (!data.cliente_id) throw new Error("cliente_id es obligatorio.");

  if (!data.cliente_nombre) throw new Error("cliente_nombre es obligatorio.");

  if (!data.descripcion?.trim())
    throw new Error("La descripción es obligatoria.");

  if (!data.categoria) throw new Error("La categoría es obligatoria.");

  const prioridades = ["info", "importante", "critico"];

  if (!prioridades.includes(data.prioridad))
    throw new Error("Prioridad inválida.");

  const id = await API.getFolio("AVI");

  const aviso = {
    id,

    cliente_id: data.cliente_id,

    cliente_nombre: data.cliente_nombre,

    prioridad: data.prioridad,

    categoria: data.categoria,

    descripcion: data.descripcion.trim(),

    activo: data.activo ?? true,

    origen: data.origen ?? "manual",

    fecha: data.fecha ?? hoy(),

    hora:
      data.hora ??
      new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),

    usuario_creacion: data.usuario_creacion ?? "",

    usuario_actualizacion: data.usuario_actualizacion ?? "",
  };

  DB.set("cliente_avisos", [...DB.get("cliente_avisos"), aviso]);

  // Sincronización en segundo plano.
  // Los avisos son datos no críticos, por lo que la UI no espera
  // la respuesta del motor híbrido.
  DATA.save("cliente_avisos", id, aviso).catch((err) => {
    console.error("Error sincronizando aviso:", err);
  });

  return aviso;
};

AVISOS.update = async function (id, data) {
  const avisos = DB.get("cliente_avisos");

  const index = avisos.findIndex((a) => a.id === id);

  if (index === -1) throw new Error("Aviso no encontrado.");

  const actualizado = {
    ...avisos[index],

    ...data,

    usuario_actualizacion: data.usuario_actualizacion ?? "",
  };

  avisos[index] = actualizado;

  DB.set("cliente_avisos", avisos);

  // Sincronización en segundo plano.
  DATA.update("cliente_avisos", id, actualizado).catch((err) => {
    console.error("Error actualizando aviso:", err);
  });

  return actualizado;
};

AVISOS.delete = async function (id) {
  const avisos = DB.get("cliente_avisos");

  const aviso = avisos.find((a) => a.id === id);

  if (!aviso) throw new Error("Aviso no encontrado.");

  DB.set(
    "cliente_avisos",
    avisos.filter((a) => a.id !== id),
  );

  // Sincronización en segundo plano.
  DATA.delete("cliente_avisos", id).catch((err) => {
    console.error("Error eliminando aviso:", err);
  });

  return true;
};

AVISOS.estado = function (clienteId) {
  const avisos = AVISOS.list(clienteId).filter((a) => a.activo);

  if (!avisos.length) {
    return {
      color: "green",
      icono: "🟢",
      texto: "Sin avisos",
    };
  }

  if (avisos.some((a) => a.prioridad === "critico")) {
    return {
      color: "red",
      icono: "🔴",
      texto: "Aviso crítico",
    };
  }

  if (avisos.some((a) => a.prioridad === "importante")) {
    return {
      color: "yellow",
      icono: "🟡",
      texto: "Aviso importante",
    };
  }

  return {
    color: "green",
    icono: "🟢",
    texto: "Información",
  };
};

window.AVISOS = AVISOS;
