//! An end-to-end example of using the SP1 SDK to generate a proof of a program that can have an
//! EVM-Compatible proof generated which can be verified on-chain.
//!
//! You can run this script using the following command:
//! ```shell
//! RUST_LOG=info cargo run --release --bin evm -- --system groth16
//! ```
//! or
//! ```shell
//! RUST_LOG=info cargo run --release --bin evm -- --system plonk
//! ```
//! You can also specify a custom PDF path:
//! ```shell
//! RUST_LOG=info cargo run --release --bin evm -- --system groth16 --pdf-path path/to/your/certificate.pdf
//! ```

use alloy_sol_types::SolType;
use clap::{Parser, ValueEnum};
use serde::{Deserialize, Serialize};
use sp1_sdk::{
    include_elf, HashableKey, ProverClient, SP1ProofWithPublicValues, SP1Stdin, SP1VerifyingKey,
};
use std::path::PathBuf;
use zkpdf_template_lib::PublicValuesStruct;

/// The ELF (executable and linkable format) file for the Succinct RISC-V zkVM.
pub const ZKPDF_TEMPLATE_ELF: &[u8] = include_elf!("zkpdf-template-program");

/// The arguments for the EVM command.
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct EVMArgs {
    #[arg(long, value_enum, default_value = "groth16")]
    system: ProofSystem,
    #[arg(long, default_value = "../samples/GST-certificate.pdf")]
    pdf_path: String,
}

/// Enum representing the available proof systems
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Debug)]
enum ProofSystem {
    Plonk,
    Groth16,
}

/// A fixture that can be used to test the verification of SP1 zkVM proofs inside Solidity.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SP1GSTProofFixture {
    gst_number: String,
    legal_name: String,
    signature_valid: bool,
    document_commitment: String,
    public_key_hash: String,
    vkey: String,
    public_values: String,
    proof: String,
}

fn main() {
    // Setup the logger.
    sp1_sdk::utils::setup_logger();

    // Parse the command line arguments.
    let args = EVMArgs::parse();

    // Setup the prover client.
    let client = ProverClient::from_env();

    // Setup the program.
    let (pk, vk) = client.setup(ZKPDF_TEMPLATE_ELF);

    // Read PDF bytes from file
    let pdf_bytes = std::fs::read(&args.pdf_path)
        .unwrap_or_else(|_| panic!("Failed to read PDF file from: {}", args.pdf_path));

    // Setup the inputs.
    let mut stdin = SP1Stdin::new();
    stdin.write(&pdf_bytes);

    println!("PDF Path: {}", args.pdf_path);
    println!("PDF Size: {} bytes", pdf_bytes.len());
    println!("Proof System: {:?}", args.system);

    // Generate the proof based on the selected proof system.
    let proof = match args.system {
        ProofSystem::Plonk => client.prove(&pk, &stdin).plonk().run(),
        ProofSystem::Groth16 => client.prove(&pk, &stdin).groth16().run(),
    }
    .expect("failed to generate proof");

    create_proof_fixture(&proof, &vk, args.system);
}

/// Create a fixture for the given proof.
fn create_proof_fixture(
    proof: &SP1ProofWithPublicValues,
    vk: &SP1VerifyingKey,
    system: ProofSystem,
) {
    // Deserialize the public values.
    let bytes = proof.public_values.as_slice();
    let PublicValuesStruct {
        gst_number,
        legal_name,
        signature_valid,
        document_commitment,
        public_key_hash,
    } = PublicValuesStruct::abi_decode(bytes).unwrap();

    // Create the testing fixture so we can test things end-to-end.
    let fixture = SP1GSTProofFixture {
        gst_number,
        legal_name,
        signature_valid,
        document_commitment: format!("0x{}", hex::encode(document_commitment.as_ref() as &[u8])),
        public_key_hash: format!("0x{}", hex::encode(public_key_hash.as_ref() as &[u8])),
        vkey: vk.bytes32().to_string(),
        public_values: format!("0x{}", hex::encode(bytes)),
        proof: format!("0x{}", hex::encode(proof.bytes())),
    };

    // The verification key is used to verify that the proof corresponds to the execution of the
    // program on the given input.
    //
    // Note that the verification key stays the same regardless of the input.
    println!("Verification Key: {}", fixture.vkey);

    // The public values are the values which are publicly committed to by the zkVM.
    //
    // If you need to expose the inputs or outputs of your program, you should commit them in
    // the public values.
    println!("Public Values: {}", fixture.public_values);

    // The proof proves to the verifier that the program was executed with some inputs that led to
    // the give public values.
    println!("Proof Bytes: {}", fixture.proof);

    // Save the fixture to a file.
    let fixture_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../contracts/src/fixtures");
    std::fs::create_dir_all(&fixture_path).expect("failed to create fixture path");
    std::fs::write(
        fixture_path.join(format!("{:?}-fixture.json", system).to_lowercase()),
        serde_json::to_string_pretty(&fixture).unwrap(),
    )
    .expect("failed to write fixture");
}
