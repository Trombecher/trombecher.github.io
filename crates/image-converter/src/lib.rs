use std::io::Cursor;
use wasm_bindgen::prelude::*;
use image::{load_from_memory, ImageFormat};

// Enable WASM-bindgen for the library
#[wasm_bindgen]
pub fn convert_image(input: &[u8], output_format: &str) -> Vec<u8> {
    let img = load_from_memory(input).expect("Failed to load image");
    let mut buffer = Vec::new();

    // Match the desired output format
    let format = match output_format {
        "png" => ImageFormat::Png,
        "jpeg" => ImageFormat::Jpeg, // 80% quality
        "gif" => ImageFormat::Gif,
        "bmp" => ImageFormat::Bmp,
        "tiff" => ImageFormat::Tiff,
        "webp" => ImageFormat::WebP,
        "avif" => ImageFormat::Avif,

        _ => panic!("Unsupported format!"),
    };

    // Write the converted image into the buffer
    img.write_to(&mut Cursor::new(&mut buffer), format).expect("Failed to write image");

    buffer
}