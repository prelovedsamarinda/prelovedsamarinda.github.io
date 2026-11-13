// Nomor WhatsApp tujuan pesanan (awali dengan 62 tanpa tanda + atau 0)
const NOMOR_WA_ADMIN = "6282156407042";

// Titik koordinat cadangan jika produk tidak punya data lokasi
const LOKASI_TOKO = {
  lat: -0.4795,
  lon: 117.157972,
};

let keranjang = JSON.parse(localStorage.getItem("data_keranjang")) || [];
let subtotalBelanja = 0;
let ongkosKirim = 0;
let totalAkhir = 0;
let sudahCekOngkir = false;
let jumlahKurir = 1;
let rincianOngkirPerTitik = [];

// 1. Muat daftar produk saat halaman dibuka
window.addEventListener("DOMContentLoaded", () => {
  const wadahProduk = document.getElementById("daftar-produk-bayar");
  subtotalBelanja = 0;

  if (keranjang.length === 0) {
    wadahProduk.innerHTML = "<p>Keranjang masih kosong.</p>";
  } else {
    wadahProduk.innerHTML = keranjang
      .map((item) => {
        subtotalBelanja += item.harga;
        return `<div class="item-produk-baris">
                  <span>${item.nama}</span>
                  <span>Rp ${item.harga.toLocaleString("id-ID")}</span>
                </div>`;
      })
      .join("");
  }

  ubahOpsiPengiriman();
});

// 2. Rumus Jarak Garis Lurus (Haversine) dalam Kilometer
function hitungJarakKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 3. Tarif Kurir Samarinda
function hitungTarifKurir(jarakKm) {
  if (jarakKm <= 3) {
    return 10000;
  } else if (jarakKm <= 5) {
    return 15000;
  }else {
    return 15000 + Math.ceil(jarakKm - 5) * 3000;
  }
}

// 4. Hitung Ongkir Otomatis dari Koordinat Penjual ke Jalan Pembeli
async function hitungOngkirOtomatis() {
  const inputJalan = document.getElementById("jalanUtama");
  const infoJarak = document.getElementById("info-jarak");
  const teksJalan = inputJalan.value.trim();

  if (!teksJalan) {
    document.getElementById("err-jalan").style.display = "block";
    inputJalan.classList.add("input-error");
    return;
  } else {
    document.getElementById("err-jalan").style.display = "none";
    inputJalan.classList.remove("input-error");
  }

  infoJarak.innerText = "⏳ Sedang menghitung rute & jumlah kurir...";
  infoJarak.style.color = "#0284c7";

  try {
    const queryAlamat = `${teksJalan}, Samarinda`;
    const baseUrl = "https://" + "nominatim." + "openstreetmap.org/search";
    const params = new URLSearchParams({
      format: "json",
      q: queryAlamat,
      limit: 1,
    });

    const response = await fetch(baseUrl + "?" + params.toString());
    const data = await response.json();

    if (data.length === 0) {
      ongkosKirim = 15000;
      jumlahKurir = 1;
      infoJarak.innerText = "Jalan tidak spesifik di peta, ongkir flat Rp 15.000 diterapkan.";
      infoJarak.style.color = "#d97706";
    } else {
      // Pastikan ada di belakang data
      const latPembeli = parseFloat(data[0].lat);
      const lonPembeli = parseFloat(data[0].lon);

      // Kelompokkan lokasi penjual yang UNIK (beda titik = beda kurir)
      const lokasiUnik = [];
      keranjang.forEach((item) => {
        const latItem = item.lat || LOKASI_TOKO.lat;
        const lonItem = item.lon || LOKASI_TOKO.lon;

        const sudahAda = lokasiUnik.some(
          (lok) => lok.lat === latItem && lok.lon === lonItem
        );

        if (!sudahAda) {
          lokasiUnik.push({ lat: latItem, lon: lonItem, produk: [item.nama] });
        } else {
          const target = lokasiUnik.find(
            (lok) => lok.lat === latItem && lok.lon === lonItem
          );
          target.produk.push(item.nama);
        }
      });

      // Hitung ongkir dari masing-masing titik penjual ke pembeli
      let totalOngkirGabungan = 0;
      rincianOngkirPerTitik = [];

      lokasiUnik.forEach((titik, index) => {
        const jarakLurus = hitungJarakKm(titik.lat, titik.lon, latPembeli, lonPembeli);
        const jarakJalan = jarakLurus * 1.8;
        const tarifTitik = hitungTarifKurir(jarakJalan);

        totalOngkirGabungan += tarifTitik;
        rincianOngkirPerTitik.push({
          kurirKe: index + 1,
          produk: titik.produk.join(", "),
          jarak: jarakJalan.toFixed(1),
          ongkir: tarifTitik,
          mapsUrl: `https://google.com{titik.lat},${titik.lon}`
        });
      });

      ongkosKirim = totalOngkirGabungan;
      jumlahKurir = lokasiUnik.length;

      if (jumlahKurir > 1) {
        infoJarak.innerText = `✅ ${jumlahKurir} lokasi penjual berbeda (${jumlahKurir} Kurir) • Ongkir otomatis digabung`;
      } else {
        // Pastikan ada di belakang rincianOngkirPerTitik
        infoJarak.innerText = `✅ Jarak pengiriman: ± ${rincianOngkirPerTitik[0].jarak} km (1 Kurir)`;
      }
      infoJarak.style.color = "#16a34a";
    }
  } catch (error) {
    ongkosKirim = 15000;
    infoJarak.innerText = "Gagal cek peta, ongkir standar Rp 15.000 diterapkan.";
    infoJarak.style.color = "#dc2626";
  }

  sudahCekOngkir = true;
  ubahOpsiPengiriman();
}


// 5. Atur Tampilan Kotak Pilihan (Diantar vs Ambil Sendiri)
function ubahOpsiPengiriman() {
  const pilihan = document.querySelector('input[name="pengiriman"]:checked').value;
  const boxDiantar = document.getElementById("detail-diantar");
  const boxAmbil = document.getElementById("detail-ambil");
  const cardAntar = document.getElementById("card-antar");
  const cardAmbil = document.getElementById("card-ambil");

  if (pilihan === "antar") {
    boxDiantar.classList.remove("tersembunyi");
    boxAmbil.classList.add("tersembunyi");
    cardAntar.classList.add("aktif");
    cardAmbil.classList.remove("aktif");
    totalAkhir = subtotalBelanja + ongkosKirim;
  } else {
    boxDiantar.classList.add("tersembunyi");
    boxAmbil.classList.remove("tersembunyi");
    cardAntar.classList.remove("aktif");
    cardAmbil.classList.add("aktif");
    totalAkhir = subtotalBelanja;
  }

  document.getElementById("tampil-subtotal").innerText = subtotalBelanja.toLocaleString("id-ID");
  document.getElementById("tampil-ongkir").innerText = ongkosKirim.toLocaleString("id-ID");
  document.getElementById("tampil-total-antar").innerText = (subtotalBelanja + ongkosKirim).toLocaleString("id-ID");
  document.getElementById("tampil-total-ambil").innerText = subtotalBelanja.toLocaleString("id-ID");
}

// 6. Validasi Form & Kirim Pesanan ke WhatsApp
document.getElementById("formPembayaran").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nama = document.getElementById("namaPembeli");
  const wa = document.getElementById("waPembeli");
  const jalan = document.getElementById("jalanUtama");
  const detail = document.getElementById("detailAlamat");
  const opsiKirim = document.querySelector('input[name="pengiriman"]:checked').value;
  

  let valid = true;

  // Cek Nama
  if (nama.value.trim() === "") {
    document.getElementById("err-nama").style.display = "block";
    nama.classList.add("input-error");
    valid = false;
  } else {
    document.getElementById("err-nama").style.display = "none";
    nama.classList.remove("input-error");
  }

  // Cek Nomor WA
  if (wa.value.trim() === "") {
    document.getElementById("err-wa").style.display = "block";
    wa.classList.add("input-error");
    valid = false;
  } else {
    document.getElementById("err-wa").style.display = "none";
    wa.classList.remove("input-error");
  }

  // Cek Alamat hanya jika memilih Diantar Kurir
  if (opsiKirim === "antar") {
    if (jalan.value.trim() === "") {
      document.getElementById("err-jalan").style.display = "block";
      jalan.classList.add("input-error");
      valid = false;
    } else {
      document.getElementById("err-jalan").style.display = "none";
      jalan.classList.remove("input-error");
    }

    if (detail.value.trim() === "") {
      document.getElementById("err-detail").style.display = "block";
      detail.classList.add("input-error");
      valid = false;
    } else {
      document.getElementById("err-detail").style.display = "none";
      detail.classList.remove("input-error");
    }

    // Jika user langsung klik Bayar tanpa klik Cek Ongkir dulu, hitung otomatis
    if (valid && !sudahCekOngkir) {
      await hitungOngkirOtomatis();
    }
  }

  if (!valid) return;

  // Susun teks pesanan ke WhatsApp
    const daftarBaju = keranjang
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.nama} (Rp ${item.harga.toLocaleString("id-ID")})`
    )
    .join("\n");

  const metodeBayar =
    opsiKirim === "ambil"
      ? "Bayar Langsung saat Ambil"
      : document.querySelector('input[name="metode"]:checked').value;

  let infoPengiriman = "";
  if (opsiKirim === "antar") {
    const detailKurirWA = rincianOngkirPerTitik
      .map(
        (k) =>
          `- Kurir ${k.kurirKe} (${k.produk}): ±${k.jarak} km | Rp ${k.ongkir.toLocaleString("id-ID")}\n  Titik Jemput: ${k.mapsUrl}`
      )
      .join("\n");

    infoPengiriman = `Diantar Kurir (${jumlahKurir} Armada)\nAlamat Pembeli: ${jalan.value.trim()}, ${detail.value.trim()}, Samarinda\nTotal Ongkir: Rp ${ongkosKirim.toLocaleString("id-ID")}`;
  } else {
    infoPengiriman = `Ambil Sendiri`;
  }

  const pesanWA = `Halo, saya mau konfirmasi pesanan preloved:\n\n*Nama:* ${nama.value.trim()}\n*No. WA:* ${wa.value.trim()}\n\n*Pesanan:*\n${daftarBaju}\n\n*Pengiriman:* ${infoPengiriman}\n*Metode Bayar:* ${metodeBayar}\n*Total Tagihan:* Rp ${totalAkhir.toLocaleString("id-ID")}`;

  // Menggunakan penggabungan string (+) agar bagian /${NOMOR_WA_ADMIN} tidak terpotong
  const urlWA = "https://" + "wa.me/" + NOMOR_WA_ADMIN + "?text=" + encodeURIComponent(pesanWA);
  window.open(urlWA, "_blank");
});


function ubahMetodeBayar() {
  const metode = document.querySelector('input[name="metode"]:checked').value;
  const boxQris = document.getElementById("box-qris");

  if (metode === "QRIS") {
    boxQris.style.display = "block";
  } else {
    boxQris.style.display = "none";
  }
}
