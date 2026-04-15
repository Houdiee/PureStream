{
  description = "A minimal development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          pnpm
          nodejs

          rustc
          cargo
          wasm-pack
          lld

          go
        ];

        shellHook = ''
          echo "Welcome to your minimal development environment!"
        '';
      };
    };
}
