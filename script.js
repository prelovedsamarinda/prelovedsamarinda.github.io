
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
function tambahKeKeranjang(namaProduk, hargaProduk, latPenjual, lonPenjual, tombol) {

  const sudahAda = keranjang.some(item => item.nama === namaProduk);
    if (sudahAda) {
        return; // Hentikan biar nggak masuk dua kali
    }

    // Masukkan data produk baru ke dalam array
    keranjang.push({
        nama: namaProduk,
        harga: hargaProduk,
        lat: latPenjual,
        lon: lonPenjual
    });

    localStorage.setItem('data_keranjang', JSON.stringify(keranjang));

    // Panggil fungsi milik Anda untuk memperbarui tampilan UI & Notifikasi
    updateTampilanKeranjang();

    if (tombol) {
        const card = tombol.closest('.produk-card');
        if (card) {
            card.classList.add('sudah-diklaim');
        }
        tombol.disabled = true;
        tombol.innerHTML = '✓'; // Ubah ikon keranjang jadi centang
    }


    // Feedback visual sederhana agar pembeli tahu produk berhasil masuk
    // alert(`Berhasil menambahkan ${namaProduk} ke keranjang!`);
}

// FUNGSI TAMBAHAN: Untuk menghapus barang (karena di fungsi updateTampilanKeranjang Anda memanggil fungsi ini)
function hapusDariKeranjang(index) {
    // Hapus 1 item berdasarkan index-nya
    keranjang.splice(index, 1);

    localStorage.setItem('data_keranjang', JSON.stringify(keranjang));
    
    // Perbarui kembali tampilannya
    updateTampilanKeranjang();
}



function updateTampilanKeranjang() {
    const daftarKeranjang = document.getElementById('daftar-keranjang');
    const totalHargaHTML = document.getElementById('total-harga');
    const jumlahNotif = document.getElementById('jumlah-notif'); // Mengambil element notif navbar
    
    if (!daftarKeranjang || !totalHargaHTML || !jumlahNotif) return;
    
    daftarKeranjang.innerHTML = '';
    
    // Perbarui jumlah angka di navbar
    if (keranjang.length === 0) {
        daftarKeranjang.innerHTML = '<li class="keranjang-kosong">Keranjang masih kosong. Silakan pilih produk!</li>';
        totalHargaHTML.innerText = '0';
        jumlahNotif.style.display = 'none'; // Sembunyikan angka merah kalau kosong
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
    
    // Tampilkan jumlah item di navbar
    jumlahNotif.innerText = keranjang.length;
    jumlahNotif.style.display = 'block'; // Munculkan bulatan merah
     sinkronkanKartuProduk();
}

// FUNGSI BARU: Membantu geser otomatis ke area checkout saat ikon navbar di-klik
function pindahKeKeranjang(event) {
    event.preventDefault();
    const target = document.querySelector('.keranjang-section');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' }); // Efek geser halus/smooth
    }
}

  
// ==========================================
// LOGIKA PENGALIHAN HALAMAN PEMBAYARAN QRIS
const btnLanjut = document.getElementById("pay-button");
const elemenTotal = document.getElementById("total-harga");
const elemenAlamat = document.getElementById("alamat"); 

btnLanjut.addEventListener("click", function () {
  // Ubah teks seperti "50.000" menjadi angka murni "50000"
  const totalMurni = elemenTotal.innerText.replace(/[^0-9]/g, "");
  const alamatPembeli = elemenAlamat ? elemenAlamat.value.trim() : "";

  // Simpan ke memori browser
  localStorage.setItem("totalBelanja", totalMurni);
  localStorage.setItem("alamatPembeli", alamatPembeli);

  // Pindah ke halaman kedua
  window.location.href = "bayar.html";
});

// Jalankan otomatis setiap kali halaman dibuka atau di-reload
document.addEventListener('DOMContentLoaded', function () {
    // Pastikan ambil data terbaru dari localStorage
    const dataTersimpan = JSON.parse(localStorage.getItem('data_keranjang')) || [];
    const semuaCard = document.querySelectorAll('.produk-card');

    semuaCard.forEach(card => {
        const elemenJudul = card.querySelector('h3');
        if (!elemenJudul) return;

        const namaProdukDiCard = elemenJudul.innerText.trim();

        // Cek apakah nama produk di card ini ada di dalam data keranjang
        const sudahMasuk = dataTersimpan.some(item => item.nama.trim() === namaProdukDiCard);

        if (sudahMasuk) {
            // 1. Munculin lagi label "Di Keranjang" & redupin fotonya
            card.classList.add('sudah-diklaim');

            // 2. Ubah lagi tombol keranjang jadi tanda centang & matikan kliknya
            const tombol = card.querySelector('.btn-keranjang');
            if (tombol) {
                tombol.disabled = true;
                tombol.innerHTML = '✓';
            }
        }
         sinkronkanKartuProduk();
    });
});

function sinkronkanKartuProduk() {
    const semuaCard = document.querySelectorAll('.produk-card');

    semuaCard.forEach(card => {
        const tombol = card.querySelector('.btn-keranjang');
        if (!tombol) return;

        // Ambil teks atribut onclick dari tombol (contoh: "tambahKeKeranjang('Cardigan', ...)")
        const atributOnclick = tombol.getAttribute('onclick') || '';

        // Cek apakah salah satu nama produk di array keranjang ada di dalam onclick tombol ini
        const masihDiKeranjang = keranjang.some(item => atributOnclick.includes(`'${item.nama}'`));

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

function geserKatalog(arah) {
  const slider = document.getElementById('katalogSlider');
  const jarakGeser = 260; // Lebar kartu + gap
  slider.scrollBy({
    left: arah * jarakGeser,
    behavior: 'smooth'
  });
}
