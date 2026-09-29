// CRM
function filtOrdCli() {
  const cid = document.getElementById("crm-cli").value;
  const ords = cid ? DB.get("ordenes").filter((o) => o.cliente_id === cid) : [];
  document.getElementById("crm-ord").innerHTML =
    '<option value="">-- Seleccionar orden --</option>' +
    ords
      .map(
        (o) =>
          `<option value="${o.id}">${o.folio} — ${o.tipo_equipo} — ${o.estado}</option>`,
      )
      .join("");
}
async function saveSeg() {
  const cid = document.getElementById("crm-cli").value;

  if (!cid) {
    ARABOT.alert({
      title: "Cliente requerido",

      message: "Selecciona un cliente.",

      details: "Debes seleccionar un cliente antes de guardar el seguimiento.",
    });

    return;
  }

  const c = DB.get("clientes").find((x) => x.id === cid);

  const oid = document.getElementById("crm-ord").value;

  const ord = oid ? DB.get("ordenes").find((o) => o.id === oid) : null;

  const tel = ord?.tel || c?.tel || "";

  const ss = DB.get("segs");

  const seg = {
    id: "S" + Date.now(),

    cliente_id: cid,

    cliente_nombre: c ? c.nombre : "",

    folio: oid || "",

    fdisp: ord ? ord.folio : "",

    tipo: document.getElementById("crm-tipo").value,

    fecha: document.getElementById("crm-fch").value,

    notas: document.getElementById("crm-notas").value,

    hecho: false,

    tel,
  };

  ss.push(seg);

  DB.set("segs", ss);

  await DATA.save("segs", seg.id, seg);

  document.getElementById("crm-notas").value = "";

  document.getElementById("crm-fch").value = "";

  rndCRM();

  notify("Seguimiento guardado ✅");
}

function rndCRM() {
  fillClis(["crm-cli"], "-- Seleccionar --");

  const ss = DB.get("segs").filter((s) => !s.hecho);

  const cont = document.getElementById("crm-pend");
  if (!ss.length) {
    cont.innerHTML = '<div class="nd">Sin seguimientos pendientes 🎉</div>';
    return;
  }
  const h = hoy();
  cont.innerHTML = ss
    .sort((a, b) => (a.fecha > b.fecha ? 1 : -1))
    .map((s) => {
      const waNum = String(s.tel || "").replace(/\D/g, "");
      const waLink = waNum
        ? `https://wa.me/52${waNum}?text=${encodeURIComponent("Hola buenas tardes, te escribimos de Aratech para conocer como está funcionando su equipo y preguntar como ha sido su experiencia con nosotros.")}`
        : "";
      return `<div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
      <span class="sm ${s.fecha && s.fecha < h ? "sr" : "so"}" style="margin-top:5px"></span>
      <div style="flex:1">
        <b>${s.cliente_nombre}</b>${s.fdisp ? ` — <span style="color:var(--accent);font-size:11px">${s.fdisp}</span>` : ""}
        <span style="margin-left:7px;color:var(--text2);font-size:11px">${s.tipo}</span>
        ${s.es_mant ? '<span class="tag tg" style="font-size:10px;margin-left:5px"><i class="ar-icon success"></i> Mant. gratuito</span>' : ""}
        <div style="font-size:11px;color:var(--text3)">${s.notas || ""}</div>
        <div style="font-size:10px;color:var(--text3)">${fmt(s.fecha)}</div>
      </div>
      <div style="display:flex;gap:5px;align-items:center">
        ${waLink ? `<a href="${waLink}" target="_blank" class="btn bw bsm"><i class="ar-icon whatsapp"></i></a>` : ""}
        <button class="btn bs bsm" onclick="doneS('${s.id}')"><i class="ar-icon success"></i></button>
      </div>
    </div>`;
    })
    .join("");

  window.refreshIcons(cont);
}
async function doneS(id) {
  const ss = DB.get("segs");
  const i = ss.findIndex((s) => s.id === id);
  if (i >= 0) {
    ss[i].hecho = true;

    DB.set("segs", ss);

    await DATA.update("segs", id, {
      hecho: true,
    });
  }

  rndCRM();
}

window.filtOrdCli = filtOrdCli;
window.saveSeg = saveSeg;
window.rndCRM = rndCRM;
window.doneS = doneS;
