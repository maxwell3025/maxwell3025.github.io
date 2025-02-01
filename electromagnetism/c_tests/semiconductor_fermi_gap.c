#include <math.h>
#include <stdio.h>

// This is the absolute temperature.
#define TEMPERATURE 373.0
// This is Boltzmann's constant in temperature-energy.
#define BOLTZMANN 8.617E-5
// This is the expponent associated with the boltmann distributioon in per energy
#define BOLTZMANN_EXPONENT (1.0 / (TEMPERATURE * BOLTZMANN))
// This is the density of electron states within the valence and conduction bands in states per volume energy
#define STATE_DENSITY 2E26
// This is the charge of a single electron in charge per electron
#define CHARGE_ELECTRON -1.6E-19

float fermi_level_semiconductor(float gap_bottom, float gap_top, float charge_density){
  // These 2 formulas differ from the ones in Desmos since we are using negative charge for electrons.

  /*
    This formula is numerically stable when charge is positive.

    a +
    \frac{1}{k}
    \ln(
      \sqrt{
        \exp(
          k(b - a) - \frac{kx}{C_{e}\rho}
        ) +
        \frac{1}{4} \exp(2k(b - a)) (1 - \exp(-\frac{kx}{C_{e}\rho}))^2
      } -
      \frac{1}{2} \exp(k(b - a)) (1 - \exp(-\frac{kx}{C_{e}\rho}))
    )

    This formula is numerically stable when charge is negative.

    b -
    \frac{1}{k}
    \ln(
      \sqrt{
        \exp(
          k(b - a) + \frac{kx}{C_{e}\rho}
        ) +
        \frac{1}{4} \exp(2k(b - a)) (1 - \exp(\frac{kx}{C_{e}\rho}))^2
      } -
      \frac{1}{2} \exp(k(b - a)) (1 - \exp(\frac{kx}{C_{e}\rho}))
    )
  */
  if(charge_density > 0.0){
    return gap_bottom +
    1.0 / BOLTZMANN_EXPONENT *
    log(
      sqrt(
        exp(
          BOLTZMANN_EXPONENT *
          (gap_top - gap_bottom) -
          (BOLTZMANN_EXPONENT * charge_density) / (CHARGE_ELECTRON * STATE_DENSITY)
        ) +
        0.25 * exp(
          2.0 *
          BOLTZMANN_EXPONENT *
          (gap_top - gap_bottom)
        ) *
        pow(
          (1.0 - exp(-(BOLTZMANN_EXPONENT * charge_density)/(CHARGE_ELECTRON * STATE_DENSITY))),
          2.0
        )
      ) -
      0.5 *
      exp(
        BOLTZMANN_EXPONENT *
        (gap_top - gap_bottom)
      ) *
      (1.0 - exp(-(BOLTZMANN_EXPONENT * charge_density)/(CHARGE_ELECTRON * STATE_DENSITY)))
    );
  }
  else{
    return gap_top -
    1.0 / BOLTZMANN_EXPONENT *
    log(
      sqrt(
        exp(
          BOLTZMANN_EXPONENT *
          (gap_top - gap_bottom) +
          (BOLTZMANN_EXPONENT * charge_density) / (CHARGE_ELECTRON * STATE_DENSITY)
        ) +
        0.25 * exp(
          2.0 *
          BOLTZMANN_EXPONENT *
          (gap_top - gap_bottom)
        ) *
        pow(
          (1.0 - exp((BOLTZMANN_EXPONENT * charge_density)/(CHARGE_ELECTRON * STATE_DENSITY))),
          2.0
        )
      ) -
      0.5 *
      exp(
        BOLTZMANN_EXPONENT *
        (gap_top - gap_bottom)
      ) *
      (1.0 - exp((BOLTZMANN_EXPONENT * charge_density)/(CHARGE_ELECTRON * STATE_DENSITY)))
    );
  }
  return 0.0;
}

int main(){
    printf(
        "fermi_level_semiconductor(-0.6, 0.6, %f) = %f\n",
        -1.5E7,
        fermi_level_semiconductor(-0.6, 0.6, -1.5E7)
    );
}
