import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

interface ElevatorPitchFramework {
  customer: string;
  problem: string;
  productName: string;
  productType: string;
  functionality: string;
  competitors: string;
  differentiation: string;
}

class ArchitectContext {
  config: GluonConfigure;
  private readonly elevatorPitch: ElevatorPitchFramework;

  constructor(config: GluonConfigure) {
    this.config = config;
    this.elevatorPitch = {
      customer: "",
      problem: "",
      productName: "",
      productType: "",
      functionality: "",
      competitors: "",
      differentiation: "",
    };
  }

  getElevatorPitch() {
    return this.elevatorPitch;
  }
}

export default ArchitectContext;
export type { ElevatorPitchFramework };
