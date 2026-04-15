use hdbscan::{Hdbscan, HdbscanHyperParams, NnAlgorithm};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = getClusterLabels)]
pub fn get_cluster_labels(flat_points: Vec<f64>) -> Vec<i32> {
    if flat_points.is_empty() {
        return vec![];
    }

    let points: Vec<Vec<f64>> = flat_points.chunks(2).map(|p| p.to_vec()).collect();

    let config = HdbscanHyperParams::builder()
        .min_cluster_size(2)
        .min_samples(1)
        .allow_single_cluster(true)
        .epsilon(5.0)
        .nn_algorithm(NnAlgorithm::BruteForce)
        .build();

    let clusterer = Hdbscan::new(&points, config);

    clusterer
        .cluster()
        .unwrap_or_else(|_| vec![-1; points.len()])
}
