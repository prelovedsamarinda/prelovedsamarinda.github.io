// 1. KONFIGURASI NOMOR WHATSAPP ADMIN
const NOMOR_WA_ADMIN = "6281234567890";

// 2. AMBIL DATA PRODUK & KERANJANG DARI MEMORI BROWSER
const produkAktif = JSON.parse(localStorage.getItem("produk_detail_aktif")) || {
  id: "produk-0",
  nama: "Baju Kemeja Pria Keren",
  harga: 75000,
  ukuran: "XL (LD 116 cm × P 72 cm)",
  kondisi: "9.5/10 (Like New)",
  brand: "Uniqlo",
  bahan: "Katun Flanel Adem",
  deskripsi: "No minus, warna masih pekat, kancing lengkap semua. Sudah dicuci bersih dan wangi!",
  foto: ["https://placeholder.com"],
  lat: -0.4794345893937245,
  lon: 117.15853327078588
};

let keranjang = JSON.parse(localStorage.getItem("data_keranjang")) || [];

// 3. JALANKAN SAAT HALAMAN SELESAI DIMUAT
document.addEventListener("DOMContentLoaded", () => {
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  tampilkanInfoProduk();
  tampilkanGaleriFoto();
  siapkanTombolNegoWA();

  // Sinkronkan tampilan keranjang & tombol bawah saat halaman dibuka
  updateTampilanKeranjangDetail();
  cekStatusTombolBeli();
});

function tampilkanInfoProduk() {
  document.getElementById("judul-produk").innerText = produkAktif.nama;
  document.getElementById("harga-produk").innerText = "Rp " + produkAktif.harga.toLocaleString("id-ID");
  document.getElementById("spek-ukuran").innerText = produkAktif.ukuran;
  document.getElementById("spek-kondisi").innerText = produkAktif.kondisi;
  document.getElementById("spek-brand").innerText = produkAktif.brand;
  document.getElementById("spek-bahan").innerText = produkAktif.bahan;
  document.getElementById("deskripsi-produk").innerText = produkAktif.deskripsi;
}

function tampilkanGaleriFoto() {
  const fotoUtama = document.getElementById("foto-utama");
  const wadahThumb = document.getElementById("daftar-thumbnail");
  const daftarFoto = Array.isArray(produkAktif.foto) ? produkAktif.foto : [produkAktif.foto];

  fotoUtama.src = daftarFoto[0];

  daftarFoto.forEach((urlFoto, idx) => {
    const img = document.createElement("img");
    img.src = urlFoto;
    img.className = "thumb-item" + (idx === 0 ? " active" : "");

    img.addEventListener("click", () => {
      fotoUtama.src = urlFoto;
      document.querySelectorAll(".thumb-item").forEach(el => el.classList.remove("active"));
      img.classList.add("active");
    });

    wadahThumb.appendChild(img);
  });
}

function siapkanTombolNegoWA() {
  const teksPesan = `Halo Preloved Samarinda! Saya tertarik dengan produk *${produkAktif.nama}* (Rp ${produkAktif.harga.toLocaleString("id-ID")}). Masih ready dan bisa nego kak?`;
  document.getElementById("link-nego-wa").href = `https://wa.me{NOMOR_WA_ADMIN}?text=${encodeURIComponent(teksPesan)}`;
}

// Buka-tutup kotak keranjang melayang
function toggleKeranjang() {
  const box = document.getElementById("shopping-cart-box");
  if (box) {
    box.classList.toggle("active");
  }
}

// Update daftar keranjang melayang & badge merah di atas
function updateTampilanKeranjangDetail() {
  const daftarKeranjang = document.getElementById("daftar-keranjang");
  const totalHargaHTML = document.getElementById("total-harga");
  const jumlahNotif = document.getElementById("jumlah-notif");

  if (!daftarKeranjang || !totalHargaHTML || !jumlahNotif) return;

  daftarKeranjang.innerHTML = "";

  if (keranjang.length === 0) {
    daftarKeranjang.innerHTML = '<li class="keranjang-kosong">Keranjang masih kosong.</li>';
    totalHargaHTML.innerText = "0";
    jumlahNotif.style.display = "none";
    jumlahNotif.innerText = "0";
    return;
  }

  let total = 0;
  keranjang.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.nama} - Rp ${item.harga.toLocaleString("id-ID")} <button onclick="hapusDariKeranjangDetail(${index})" class="btn-hapus">Hapus</button>`;
    daftarKeranjang.appendChild(li);
    total += item.harga;
  });

  totalHargaHTML.innerText = total.toLocaleString("id-ID");
  jumlahNotif.innerText = keranjang.length;
  jumlahNotif.style.display = "block";
}

// Cek apakah produk ini sudah ada di keranjang (ubah tampilan tombol bawah)
function cekStatusTombolBeli() {
  const btnBeli = document.getElementById("btn-beli-detail");
  if (!btnBeli) return;

  const sudahAda = keranjang.some(item => item.id === produkAktif.id);
  if (sudahAda) {
    btnBeli.innerText = "Sudah di Keranjang";
    btnBeli.classList.add("sudah-masuk");
    btnBeli.disabled = true;
  } else {
    btnBeli.innerText = "+ Keranjang";
    btnBeli.classList.remove("sudah-masuk");
    btnBeli.disabled = false;
  }
}

// Hapus barang langsung dari kotak keranjang di detail.html
function hapusDariKeranjangDetail(index) {
  keranjang.splice(index, 1);
  localStorage.setItem("data_keranjang", JSON.stringify(keranjang));

  updateTampilanKeranjangDetail();
  cekStatusTombolBeli();
}

// Event saat tombol "+ Keranjang" di bawah diklik
document.getElementById("btn-beli-detail").addEventListener("click", () => {
  const sudahAda = keranjang.some(item => item.id === produkAktif.id);
  if (sudahAda) return;

  keranjang.push({
    id: produkAktif.id,
    nama: produkAktif.nama,
    harga: produkAktif.harga,
    lat: produkAktif.lat,
    lon: produkAktif.lon
  });

  // Simpan permanen ke localStorage
  localStorage.setItem("data_keranjang", JSON.stringify(keranjang));

  // Langsung perbarui keranjang melayang, badge merah, dan tombol beli!
  updateTampilanKeranjangDetail();
  cekStatusTombolBeli();
});

// Simpan total belanja saat klik Bayar
const btnBayarDetail = document.getElementById("pay-button");
if (btnBayarDetail) {
  btnBayarDetail.addEventListener("click", function () {
    const totalMurni = document.getElementById("total-harga").innerText.replace(/[^0-9]/g, "");
    localStorage.setItem("totalBelanja", totalMurni);
  });
}
