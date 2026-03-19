/**
 * 将网站图片下载到 public/images 目录
 * 运行: node scripts/download-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_IMAGES = path.join(__dirname, "..", "public", "images");

// 图片列表：本地文件名 -> 源 URL
const IMAGES = {
  "hero.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBtXR8Z_8RgejkfyuZnmGhUvmQfLR3ka6TFA6VZaO7eu7i49R5f0B4dhHi-wRjJiYjlnw7teIriLvc4k-swV83haWXmAXbN8yWRwTIor32_HMf08uSNv-H8tx0hay5XRAsSlJ0-T7w2O6SJwt4L3pIv1iGGL20YV6Gwp02MKFIqjjad93qIgQWtnM46bO-M6MHYVc7rArH2SfINNVJ52Bz01IUxwAaBd3PVSTqNN048NMcpj_AsVKtNW6IehvhS9fUp7_g1fx8St2lJ",
  "course-ai-foundations.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAvTvOwDslGE9tgkTCL5p8n_htlTVQDqFAc4FPLL7tdpyVIYgWINAjfkj2rcDjvrBV6drYEF-rBYnPPK9LGYjgWDfvDyHXxr_EyRCuGkb2BRNvkDlRqN8csS-Oe4SxMhezhmti3hs8wHRmiapTloS7Zxvve-Nmhk-d2gwWU6LSu-W_kJdsAdoM2AR5F5dM6oViZDfym8-pBqQK3D1t382tCZdIYJNMqDczUjO3HoIREcBObUGKjCVbTI4Qkh2ftC4ega76UySUigXB",
  "course-generative-design.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBiD2EqmxSyPVntnvli0qeOCto_Jf7NEWlVYBr8-H-bw7qLAnIbiE6zut6PaUH8fcb4AN6Qr40GWDyTYDDobHcmoSH3Lh2j_pyEyTkzD7L2JUNzrL9Fb3vYi4xOq1GBVnQrW2XGSSN5RbtUsjKHBDE4IhU1aZ7MLC4Sd8BbcYK5x2DkusJwWuUvjfkc0rxvHCcz_1elAVsUpuyMl43gekHfoqit6S-bmkGNdMe3lfpNIyOrGeHM-mQUrZnKe5fkkQRQ4AP13TOwBdo",
  "course-llm-engineering.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAC0PbZiOK33VNlBx2H07cGCm4fHfZ8c5unHeTchR9NdlYjkxAiar7k3PAGEQyYWoXmbekhs2x__i6OD4PfTf0AFNT_ApuH3E8WdxNGiTFO14vBZjG1fopTkgAHcyuV0w8knxDHvYM1SVGMlZYAXTjfBIxbARIQfls78TT12WG2AoQfQ9bPusfmaa_DssjrQt9MMM5RpYMDi8LdZQYTv90ofFakvS1SX6avrf2PFQmYGxtsgDs08dFA8aDpjfmWnkzcmLwTh-q5WvK6",
  "testimonial-alex.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD4joULpFJ15xlx_PPF6dXxbrK0OECAfzSL6BWmkeZPNmnJAwAGwhrW3I8uZ02TGaL758lGj-1WfLoPVbbcO4ohTOiWO_pY_ApDb1P2tZkmi9DaGusdR-pq8XekBvE056-VMe8T0PzslUQlFa4Ud5CWhtCOIhPgxEXz1Vg6BU6geYGwx3oB_FxJKxqlPMoRS52BgO3_aZONjZ13G4lfPjcJXHNvQZujp0nG_Zy_xa2vDDI9hee2mNP94GdyasGFmCfQMoV_irxPWE1F",
  "testimonial-sarah.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCbt4JjUTC2ZbmdTGKkpnVVq6829t2prropnO9azwwo9wskQXWtebDnrBcsmvol_XOJWgH1muLttGgcb7w0EDIjOBkSjVzv1RIRGmdrB7R85pOtlVf4k5ybRZuCRxmd7zY1g90wunWuOPaHVyIfT4QfBuUlch0UBz9o3LAAoOWrMd2U1Y58Gm4ZReVWOjXD02QhIua4GCKahj-d0QY5w3JERjUZf5Afs7zcQs1rb16Hx3Ev-Bpzb1M3dA2st0cz3YexMK0phkjwVCCT",
  "testimonial-marcus.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuClKOnkbFKXGn3Kzvo5VtLmBvsAsfoeQ6WcrkFWocDyOOr3r54nid3aYfD2w2gH_0Pl28yIwCuEZjhi0VZHR35YNiDkwSD3jpdxisg5jcP9iaKH3mYzZZ548O1spo9H5LvZ0t1rcAUwMyElg0sAJl_W2kAPTQwZRg4M8HAvAjHc3uUCaGfaxbnTlLH4CrqIOf0ntLoVbDaex1aVBn272_cHaZOQwRt6yEaCOTaTVw1sBCaQU7ilpUh-eVa4Diu_YQoxZv2LHo-77Xg8",
  "founder-david.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBOQZzBOlEKuSwcoV48jadybOGEpDE43WcdCTvOxBn2dXfl9DiWVFp2NEG3uKyEuDiK6dFNomP1EdBfWVfqFxq24Q4rYxIyuhN4bbas4OjtVVmQXO-EmBEqrwFAy701XSfeZIfbLR3onTJc3W4eZku_OFjYjFYQXW16azqzm9MM3W2WDl0GespWl7iT0qALplgqO7thyd5E7FrofSH80p-tLDSAzHM84F4QXxbfFMUtStkWtpDw6ojLKCyKvyDFCR68N2gXYhR3OBr",
  "founder-elena.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDzw4hJMIR9kCtTtlalFHkO6ZegPIcI-AJh-vvbYngd-VeyS0Xm6GvC4kyml5mv8aScdhDlkObSIKKbh-6JZ8KTToQBMhVCPysNGxIX_b5d61oaSO0I0bpCRSBWzmiSvXOvTA7Fp4dMa8Y9s9MftOvZoCMuNvlQLbCB90b4-0jc0-KH8M0MGc-lH5oXwEaJaH08q6VaX7Gm9iOHvgEq50khmFjdkUkN7rod8paUTSY0f2stpDKwk7j219MZrTIRsTDyjzaV8FwRWsQl",
  "founder-jameson.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuANs9Nu0_niLGmA9tM1iTj6J4AreG2j_XCEXmq2tyv6-3NZSNwrP5L07h2o4jhexPCha27poieAJmHccoJe1lArcMJ-w5d3bawAgvweIpMVuoCz4mGcWDz7wYi0zvmnD5GVUePxYoDNKbqw8oBve5HybsXRZ6lvtdFKL2LB1M4TtlYhEEG9Dm9tBe1bw32dkPz7reJFDqgPEwAn3j4hdrRDUSaJJ2FR7KwursPqTA4ZWbD7Xwd6a9b-UDb39YdykNpEoWlrlDAq_Wtw",
  // 课程详情页 (courses.html)
  "course-detail-student-1.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDrINbpnUjohXL7JH1JR0O9JrPKpfZCsKAREwdt6om3abda3p3z9yY0WUQjdWfOfn9ULX9NwKTjKdTMLeEoKj8U8p8rTXr0EyG_YEg6DfdLuZcFlXR26OXEj0wvd-fksd2NMDrNQBCcEB0Si6oToCVVwJJz4KGzi1dw_ryoPp8DGDRF4i8etnMWs5AW3QMUax3cNsPMppSsWv03Vi17sh_fS8wY3qX1fxtDABorn5y32Jffls3wxUkyy2FIUXcriCtXiqWWdJRhm97G",
  "course-detail-student-2.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuChul1jDC_-DBhtuBFYYV2zeErJM9s8WofL6h5DRNB-ZM_xlYgtnImYgv5NAhv46MHHz6HQZvVk11CE_87xkeRj9IWJopI4raCAgj-NMSuR1Ydo9AJjTnsiEVgD6hXbw4PejUvA8PpCwC3QSzQf0Mb4q-2c3yr_iREtiAFkXRM2kIUOM6xfUnTIvpjwpFsuvCyAAE8tteZhTo90h0bM9h6Jjk3OMr5s5QnoKtVUC0EIFJDhEAwRC8VyQdQyanfEEA8AqRITGRch81pF",
  "course-detail-student-3.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBrj2XZii7VbqC_OLRf5q5p6xcPnhqmzRIdemoZSrzXGMDsSLKuURK6MJYs0D3zUaI9reGIzFBYXGLbg-X-Z8FXCVcn-tdTIZyXnGXI4WVKmC0KO1qTw9wTB1uT2kHXhb1cVv-NdrXZOE1ObJBI03_66354LPe6XhyTfNyr3NArloFPH7kxbU6XpJU849_gfLtc6hs7Gh5MOvR-rsFGGII2jxtJRTQ8Cpn_HWPga_Q7JW7oatpktLbM_KqcqLnJ7GYJniAcAv8Ym_2r",
  "course-instructor.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDe0ocQJQ4vH2lhXa_RoCEmI5SIIcB3D-6SLLVotwpGvDIGTiwIU4P5JPwidfuMS9kFU1ffnFglCXC8T5rzZp8yuz97Ka416xKDAni4hCmTai7d4cLuxMbLsM8WQXMbPGtOfpKIn3vqz3l_qtYRabjdfZkHpvPwqwLXNKH3Bxc6Z00bQ5rC05fp_sN5UgmJUyObLDdMhmuOnvE5gKeU6VCAUwKYV8MgIRpATQIrUQrS3timlzsk9SfXnhp9uA-qycSU8EzNzvnZkSGB",
  // 课程列表页 (courses-list.html)
  "course-neural-network.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCxmRaiYKD3L1CJjqkohXlC-CvC5MgbNLydgUuQoo37yGk4u2fgi7XjpvYQNee7iDoQoZ5GdU8LB9vKsLg-5xdL2DRKxJNdtG6LMbn3QqGe1NzRfw6GZQSTAmhPB2h5uAj_-cZJp90JmPqHhoRRmvdf_tRH-GOs5fRM8dHBp9F0JhhZPq6yi39e52kHI4pyPrvLN2090X-gwl4qpn6FKtf8_p6b_Jdz2Q2WV-qLlSxvp4Qv3wRgW7LBrx0zilTPtVuysnLVja0HwjCi",
  "course-ui-ux-design.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSc7UpDFo8TSZqr7XML7EBvCsApHmsETPc7F_zNQx4PO6_adkW0Y8kFk7mzNu5wWJffkX4oiNSboNSPkySA0gNsEazjTFOLFke21jkDxVuMvXA5faWYzRn52Un6FpkwPAFLc7VfwrnmR6ahbLK7uvinqN-9SYMWWFZYEPJ-GPor0mHqL9pLVfia8K56MH-h2cOzIBww2PRZxcIsl2uRnA0sD8i8SNf2OomjmIbUgbt8qbPaC5uixhvoNJPyMb-QGf_cxDP-hD8uwl",
  "course-full-stack.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBniJSBPmgNXCTj8utQBnmIJdJZDodoCMCHD3PMwKTiGsudoq3GisO4q3-Y3FjxqKmRWRSqDQWrmWTTOL_Yt1O7kDef5wtXWgrdYmGjAfoGYDJeT9n-_gFc0kHPmlEuYE8o-Sdsa-Jy3bIUp4UXPV_hpiFLRGqoZ0Gh1AR-GTo93zrVmDk5JRYxd55xys6bbAaYNWEFQwW5wFg_Q8mP2-0HsjuMmBG5gKL8IxF5RvBHOi1ndRhL-Hky1wEIWMU8_bH9-J4i0O5u5N6l",
  "course-process-engineering.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDqEDjY5DdVsA-3Jz8Q_w9SVLEGqykWV62YHnCjEatlkxbaMJb60gc5F9S5m9TLbLkgEDK_6IIjnLEnjxnznEJRZ4NJ8JjNzyxuW0IkMuPypXCkOecFIpmisQOfoRg4BdMR8O498CRI0QDXs20GPlPvRDsNPmyZj5yDslqBhQH0bmirHpN4YF4RcZL2nvahW8h2lUnUaX_VEG4EpM05qj8ZYQbBcI93Y-PJC1TVw_EBly8KU_D2gfZu0fkD2HCzX6sawAfboJ5BATAM",
  "course-predictive-modeling.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBK_cFSEC5IKK_0wD8rfbWHBnpMU5qetDzXf_AQiZpjyXCCouGuoojuM3sHeVnxU8TLwDXcxsQ_YxnxW-V0iJyVbvWnZV-t9oYKrkod9SmlCl0hUTzrK46eDOT6W2JURlw38yFglGX2kEH8fuWhhsT4FLtGary789rgV3MHC1fCNQy45fzsJxm7mPXEbo-sfK9CFn4uYRSy94RKffyE-PqElJsgtBnmRS4bPNNrRCQiG-OGfRpvj5GVhEdjxythXs7-du6hgPePqDUJ",
  "course-systems-optimization.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDDnwdL3JIx663eycoSKm_LyPMUGaqZ3NvKNjkzSu6IGKXrIuWrxM3YKtNJl3rW9amDpkKzPV8mgMkMOYj-bR_Tqobu2nap_u4Ui0WQd3cCuMTc-Yhm7UYkEyE4vMMfslB17CkEfVz_xyB6E2kuFMeT1XwfGZD60mi5r77uRUiCBIfIzLkO_f4qlHxzVEoMfXB031SdVEPsH1DBC6sQAYJvP9S3CBUiCUHYPok51HWSkcQqAwqFA53xuPbBaM0ncse9d0y3ha0TDvgj",
  "user-avatar.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB9fpVctNt37rwAdS71A0xQUBgTxxBFKJDeCojuQBizTTmzJbVIBI9bPjG9qiCvAwcIrWoq1gvKVw64y7q-zIFs9KSjfoY4aE6XRUTRldVEdwZ9hsvuMQlgH6z5_UE5_bx6sdcsWUs5hNhzbNYPpjyIHYDZ2hAQLx5jRaK3k4YQ1xF291owoE6dUsn4_c6mBQ5PUrGQe8hTjg8pp3ZBjSZ65DrIwPmIxwpgriM9SYjZttxkkETpeWuZwuiKWFGJ7qwf6XuHjJc-sq1F",
};

// 备用：picsum.photos 占位图（当 Google 阻止时使用）
const FALLBACK_IMAGES = {
  "hero.jpg": "https://picsum.photos/seed/neural/1200/675",
  "course-ai-foundations.jpg": "https://picsum.photos/seed/ai1/800/450",
  "course-generative-design.jpg": "https://picsum.photos/seed/ai2/800/450",
  "course-llm-engineering.jpg": "https://picsum.photos/seed/ai3/800/450",
  "testimonial-alex.jpg": "https://picsum.photos/seed/p1/96/96",
  "testimonial-sarah.jpg": "https://picsum.photos/seed/p2/96/96",
  "testimonial-marcus.jpg": "https://picsum.photos/seed/p3/96/96",
  "founder-david.jpg": "https://picsum.photos/seed/f1/256/256",
  "founder-elena.jpg": "https://picsum.photos/seed/f2/256/256",
  "founder-jameson.jpg": "https://picsum.photos/seed/f3/256/256",
  "course-detail-student-1.jpg": "https://picsum.photos/seed/s1/96/96",
  "course-detail-student-2.jpg": "https://picsum.photos/seed/s2/96/96",
  "course-detail-student-3.jpg": "https://picsum.photos/seed/s3/96/96",
  "course-instructor.jpg": "https://picsum.photos/seed/inst/256/256",
  "course-neural-network.jpg": "https://picsum.photos/seed/nn/800/450",
  "course-ui-ux-design.jpg": "https://picsum.photos/seed/ux/800/450",
  "course-full-stack.jpg": "https://picsum.photos/seed/fs/800/450",
  "course-process-engineering.jpg": "https://picsum.photos/seed/pe/800/450",
  "course-predictive-modeling.jpg": "https://picsum.photos/seed/pm/800/450",
  "course-systems-optimization.jpg": "https://picsum.photos/seed/so/800/450",
  "user-avatar.jpg": "https://picsum.photos/seed/avatar/96/96",
};

async function download(url, filepath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/*",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buf));
}

async function main() {
  fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });

  for (const [filename, url] of Object.entries(IMAGES)) {
    const filepath = path.join(PUBLIC_IMAGES, filename);
    try {
      console.log(`Downloading ${filename}...`);
      await download(url, filepath);
      console.log(`  ✓ ${filename}`);
    } catch (err) {
      console.log(`  ✗ Google failed, trying fallback for ${filename}...`);
      try {
        await download(FALLBACK_IMAGES[filename], filepath);
        console.log(`  ✓ ${filename} (fallback)`);
      } catch (e) {
        console.error(`  ✗ Failed: ${e.message}`);
      }
    }
  }
  console.log("\nDone.");
}

main();
