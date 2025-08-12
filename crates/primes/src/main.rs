use crypto_bigint::U2048;
use crypto_primes::Flavor;
use crypto_primes::multicore::random_prime;
use rand_core::{OsRng, TryRngCore};

fn main() {
    println!("{}", random_prime::<U2048, _>(OsRng.unwrap_mut().0, Flavor::Any, 16384, 8));
}