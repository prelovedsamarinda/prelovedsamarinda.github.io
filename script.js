
const menu = document.querySelector('#menu');
const navbarUtama1 = document.querySelector('.navbar-utama1'); // Hati-hati salah ketik titik (.) atau nama class!

// 2. Fungsi untuk Tombol Menu (Toggle Active)
// (Pastikan tombol #menu Anda sudah ada event click-nya di atas baris ini)
if (menu && navbarUtama1) {
    menu.onclick = () => {
        navbarUtama1.classList.toggle('active');
    };
}

// 3. Fungsi untuk Klik di Luar Menu (Untuk menutup navbar)
document.addEventListener('click', function(e) {
    // Tambahkan validasi "if" untuk memastikan elemennya memang ada di halaman tersebut
    if (menu && navbarUtama1) {
        if (!menu.contains(e.target) && !navbarUtama1.contains(e.target)) {
            navbarUtama1.classList.remove('active');
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector("#myInput");
  const searchBtn = document.querySelector("#myBtn");
  const rekomendasiBox = document.querySelector("#rekomendasi-box");

  // DATABASE PRODUK: Tempat menyimpan kata kunci dan halaman tujuan
  // Anda tinggal menambah baris di sini jika produk bertambah
  const databaseProduk = [
    { nama: "Baju Kemeja Pria Keren", keywords: ["baju", "kemeja", "pria"], url: "baju-kemeja.html" },
    { nama: "Baju Kaos Polos Cotton", keywords: ["baju", "kaos", "polos"], url: "baju-kaos.html" },
    { nama: "Sepatu Sneakers Olahraga", keywords: ["sepatu", "sneakers", "lari"], url: "sepatu-olahraga.html" },
    { nama: "Topi Hitam Distro Keren", keywords: ["topi", "hitam", "distro"], url: "topi-hitam.html" }
  ];

  // 1. FUNGSI UNTUK MENAMPILKAN REKOMENDASI SAAT MENGETIK
  function tampilkanRekomendasi() {
    const kataKunci = searchInput.value.toLowerCase().trim();
    rekomendasiBox.innerHTML = ""; // Bersihkan rekomendasi sebelumnya

    if (kataKunci === "") {
      rekomendasiBox.style.display = "none";
      return;
    }

    // Filter produk berdasarkan nama atau kata kunci yang cocok
    const hasilFilter = databaseProduk.filter(item => {
      const cocokNama = item.nama.toLowerCase().includes(kataKunci);
      const cocokKeyword = item.keywords.some(kw => kw.includes(kataKunci));
      return cocokNama || cocokKeyword;
    });

    // Jika ada produk yang cocok, tampilkan kotak rekomendasi
    if (hasilFilter.length > 0) {
      hasilFilter.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = item.nama;
        
        // KETIKA REKOMENDASI DIKLIK: Langsung pindah halaman
        div.addEventListener("click", function () {
          window.location.href = item.url;
        });

        rekomendasiBox.appendChild(div);
      });
      rekomendasiBox.style.display = "block";
    } else {
      rekomendasiBox.style.display = "none";
    }
  }

  // 2. FUNGSI UNTUK TOMBOL CARI MANUAL ATAU TEKAN ENTER
  function cariManual() {
    const kataKunci = searchInput.value.toLowerCase().trim();
    if (kataKunci === "") return;

    // Cari produk pertama yang paling mendekati kata kunci
    const produkDitemukan = databaseProduk.find(item => {
      const cocokNama = item.nama.toLowerCase().includes(kataKunci);
      const cocokKeyword = item.keywords.some(kw => kw.includes(kataKunci));
      return cocokNama || cocokKeyword;
    });

    if (produkDitemukan) {
      window.location.href = produkDitemukan.url;
    } else {
      alert("Produk tidak ditemukan!");
    }
  }

  // EVENT LISTENERS
  if (searchInput) {
    searchInput.addEventListener("input", tampilkanRekomendasi);
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") cariManual();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", cariManual);
  }

  // TUTUP KOTAK REKOMENDASI JIKA PENGGUNA KLIK DI LUAR SEARCH BAR
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !rekomendasiBox.contains(e.target)) {
      rekomendasiBox.style.display = "none";
    }
  });
});


// Ambil elemen ikon search bawaan navbar-extra Anda
const iconSearch = document.querySelector("#search");
const searchContainer = document.querySelector(".search-container");
const myInput = document.querySelector("#myInput");

if (iconSearch && searchContainer) {
  iconSearch.addEventListener("click", function (e) {
    e.preventDefault(); // Mencegah link '#' melompat
    
    // Toggle class 'aktif' untuk memunculkan/menyembunyikan search bar
    searchContainer.classList.toggle("aktif");
    
    // Otomatis arahkan kursor ketik ke dalam input saat box muncul
    if (searchContainer.classList.contains("aktif")) {
      myInput.focus();
    }
  });

  // Tambahan: Tutup search bar HP jika user klik di luar area search bar
  document.addEventListener("click", function (e) {
    if (!iconSearch.contains(e.target) && !searchContainer.contains(e.target)) {
      searchContainer.classList.remove("aktif");
    }
  });
}




// format keranjang

// FUNGSI BARU: Buka dan tutup kotak keranjang melayang tanpa reload/pindah halaman
function toggleKeranjang() {
    const cartBox = document.getElementById('shopping-cart-box');
    if (cartBox) {
        cartBox.classList.toggle('active'); // Menambah atau menghapus class 'active' dari CSS
    }
}

// Menutup kotak keranjang secara otomatis jika user mengklik di luar area keranjang
document.addEventListener('click', function (e) {
    const cartContainer = document.querySelector('.shopping-cart-container');
    const cartBox = document.getElementById('shopping-cart-box');
    
    // Tambahan: document.body.contains(e.target) memastikan tombol hapus yang hilang tidak dianggap "klik di luar"
    if (cartContainer && cartBox && document.body.contains(e.target) && !cartContainer.contains(e.target)) {
        cartBox.classList.remove('active');
    }
});



// end



// Inisialisasi array keranjang belanja di awal
let keranjang = JSON.parse(localStorage.getItem('data_keranjang')) || [];

updateTampilanKeranjang();

// FUNGSI UTAMA: Menambahkan produk saat tombol keranjang di HTML diklik

// FUNGSI TAMBAHAN: Untuk menghapus barang (karena di fungsi updateTampilanKeranjang Anda memanggil fungsi ini)

document.addEventListener('DOMContentLoaded', function () {
    // 1. Otomatis kasih ID unik ke setiap kartu produk
    const semuaCard = document.querySelectorAll('.produk-card');
    semuaCard.forEach((card, index) => {
        card.setAttribute('data-id', 'produk-' + index);
    });

    // 2. Render tampilan keranjang & sinkronkan centang saat halaman baru dibuka
    updateTampilanKeranjang();
    sinkronkanKartuProduk();
});

function tambahKeKeranjang(namaProduk, hargaProduk, latPenjual, lonPenjual, tombol) {
    const card = tombol ? tombol.closest('.produk-card') : null;
    const idProduk = card ? card.getAttribute('data-id') : namaProduk + '-' + Date.now();

    const sudahAda = keranjang.some(item => item.id === idProduk);
    if (sudahAda) {
        return;
    }

    keranjang.push({
        id: idProduk,
        nama: namaProduk,
        harga: hargaProduk,
        lat: latPenjual,
        lon: lonPenjual
    });

    localStorage.setItem('data_keranjang', JSON.stringify(keranjang));

    updateTampilanKeranjang();
    sinkronkanKartuProduk();
}

function hapusDariKeranjang(index) {
    keranjang.splice(index, 1);
    localStorage.setItem('data_keranjang', JSON.stringify(keranjang));
    
    updateTampilanKeranjang();
    sinkronkanKartuProduk();
}

function sinkronkanKartuProduk() {
    const semuaCard = document.querySelectorAll('.produk-card');

    semuaCard.forEach(card => {
        const tombol = card.querySelector('.btn-keranjang-float');
        if (!tombol) return;

        const idCard = card.getAttribute('data-id');
        const masihDiKeranjang = keranjang.some(item => item.id === idCard);

        if (masihDiKeranjang) {
            card.classList.add('sudah-diklaim');
            tombol.disabled = true;
            tombol.innerHTML = '✓';
        } else {
            card.classList.remove('sudah-diklaim');
            tombol.disabled = false;
            tombol.innerHTML = '<i data-feather="shopping-cart"></i>';
        }
    });

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function updateTampilanKeranjang() {
    const daftarKeranjang = document.getElementById('daftar-keranjang');
    const totalHargaHTML = document.getElementById('total-harga');
    const jumlahNotif = document.getElementById('jumlah-notif');
    
    if (!daftarKeranjang || !totalHargaHTML || !jumlahNotif) return;
    
    daftarKeranjang.innerHTML = '';
    
    if (keranjang.length === 0) {
        daftarKeranjang.innerHTML = '<li class="keranjang-kosong">Keranjang masih kosong. Silakan pilih produk!</li>';
        totalHargaHTML.innerText = '0';
        jumlahNotif.style.display = 'none';
        jumlahNotif.innerText = '0';
        return;
    }
    
    let total = 0;
    
    keranjang.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${item.nama} - Rp ${item.harga.toLocaleString('id-ID')} <button onclick="hapusDariKeranjang(${index})" class="btn-hapus">Hapus</button>`;
        daftarKeranjang.appendChild(li);
        total += item.harga;
    });
    
    totalHargaHTML.innerText = total.toLocaleString('id-ID');
    jumlahNotif.innerText = keranjang.length;
    jumlahNotif.style.display = 'block';
}

function pindahKeKeranjang(event) {
    event.preventDefault();
    const target = document.querySelector('.keranjang-section');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================
// LOGIKA PENGALIHAN HALAMAN PEMBAYARAN QRIS (Dikasih pengaman if biar gak crash)
const btnLanjut = document.getElementById("pay-button");
const elemenTotal = document.getElementById("total-harga");
const elemenAlamat = document.getElementById("alamat"); 

if (btnLanjut && elemenTotal) {
    btnLanjut.addEventListener("click", function () {
        const totalMurni = elemenTotal.innerText.replace(/[^0-9]/g, "");
        const alamatPembeli = elemenAlamat ? elemenAlamat.value.trim() : "";

        localStorage.setItem("totalBelanja", totalMurni);
        localStorage.setItem("alamatPembeli", alamatPembeli);

        window.location.href = "bayar.html";
    });
}

function geserKatalog(arah) {
    const slider = document.getElementById('katalogSlider');
    if (slider) {
        const jarakGeser = 260;
        slider.scrollBy({
            left: arah * jarakGeser,
            behavior: 'smooth'
        });
    }
}
