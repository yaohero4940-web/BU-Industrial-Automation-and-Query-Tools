(function () {
  const ATM_BAR = 1.01325;
  const WATER_CP = 4.186;
  const AIR_CP = 1.005;
  const STEAM_CP_SUPERHEAT = 2.19;
  const RECOVERY_LINE_DP_FACTOR = 1.296;
  const CLOSED_RECOVERY_HEAT_FACTOR = 0.97902;
  const PIPE_CLASSES = ["JIS-SGP", "JIS-STPG Sch40", "JIS-STPG Sch60", "JIS-STPG Sch80", "ANSI Sch40", "ANSI Sch80", "ANSI Sch160", "DIN 2448"];
  const NOMINAL_SIZES = ["DN6", "DN8", "DN10", "DN15", "DN20", "DN25", "DN32", "DN40", "DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500"];
  const PIPE_D = {
    "JIS-SGP": [null, 9.2, 12.7, 16.1, 21.6, 27.6, 35.7, 41.6, 52.9, 67.9, 80.7, 105.3, 130.8, 155.2, 204.7, 254.2, 304.7, 339.8, 390.6, 441.4, 492.2],
    "JIS-STPG Sch40": [7.1, 9.4, 12.7, 16.1, 21.4, 27.2, 35.5, 41.2, 52.7, 65.9, 78.1, 102.3, 126.6, 151, 199.9, 248.8, 297.9, 333.4, 381, 428.6, 477.8],
    "JIS-STPG Sch60": [6.1, 9, 11.7, 15.3, 20.4, 26.2, 33.7, 39.6, 50.7, 64.3, 75.9, 100.1, 123.6, 146.6, 195.7, 242, 289.9, 325.4, 373, 419.2, 466.8],
    "JIS-STPG Sch80": [5.7, 7.8, 10.9, 14.3, 19.4, 25, 32.9, 38.4, 49.5, 62.3, 73.9, 97.1, 120.8, 143.2, 190.9, 237.2, 283.7, 317.6, 363.6, 409.6, 455.6],
    "ANSI Sch40": [6.8326, 9.2456, 12.5222, 15.7988, 20.9296, 26.6446, 35.052, 40.894, 52.5018, 62.7126, 77.9272, 102.26, 128.194, 154.051, 202.717, 254.508, 303.225, 333.35, 381, 428.65, 477.825],
    "ANSI Sch80": [5.461, 7.6708, 10.7442, 13.8684, 18.8468, 24.3078, 32.4612, 38.1, 49.2506, 59.0042, 73.66, 97.1804, 122.25, 146.329, 193.675, 242.875, 288.9, 317.5, 363.525, 409.55, 455.625],
    "ANSI Sch160": [11.7856, 15.5448, 20.701, 29.464, 33.9852, 42.8498, 53.975, 66.6496, 87.3252, 109.55, 131.75, 173.05, 215.9, 257.2, 284.175, 325.425, 366.725, 407.975, null, null, null],
    "DIN 2448": [7, 9.9, 13.6, 17.3, 22.3, 28.5, 37.2, 43.1, 54.5, 70.3, 82.5, 107.1, 131.7, 159.3, 207.3, 260.4, 309.7, 339.6, 388.8, 437.2, 486]
  };
  const PIPE_OD_DIN = [10.2, 13.5, 17.2, 21.3, 26.9, 33.7, 42.4, 48.3, 60.3, 76.1, 88.9, 114.3, 139.7, 168.3, 219.1, 273, 323.9, 355.6, 406.4, 457.2, 508];

  const SAT = [
    [0.02, 17.5, 67.006, 73.4, 2533], [0.05, 32.9, 28.185, 137.8, 2561], [0.1, 45.8, 14.674, 191.8, 2584],
    [0.2, 60.1, 7.649, 251.5, 2609], [0.5, 81.3, 3.240, 340.5, 2646], [1.01325, 100.0, 1.673, 419.1, 2676],
    [1.5, 111.4, 1.159, 467.1, 2694], [2.0, 120.2, 0.88576, 504.7, 2706], [2.5, 127.4, 0.718, 535.4, 2716],
    [3.0, 133.5, 0.606, 561.4, 2725], [4.0, 143.6, 0.462, 604.7, 2739], [5.0, 151.8, 0.375, 640.1, 2749],
    [6.0, 158.8, 0.315, 670.4, 2757], [7.0, 164.9, 0.273, 697.1, 2763], [8.0, 170.4, 0.24033, 721.0, 2769],
    [9.0, 175.4, 0.215, 742.8, 2773], [10.0, 179.9, 0.194, 762.6, 2777], [12.0, 188.0, 0.163, 798.4, 2784],
    [15.0, 198.3, 0.132, 844.7, 2792], [20.0, 212.4, 0.100, 908.6, 2799], [25.0, 224.0, 0.080, 962.1, 2802],
    [30.0, 233.8, 0.0667, 1008, 2803], [40.0, 250.4, 0.0498, 1087, 2801], [50.0, 263.9, 0.0394, 1155, 2794],
    [60.0, 275.6, 0.0324, 1214, 2784], [80.0, 295.0, 0.0235, 1317, 2758], [100.0, 311.0, 0.0180, 1408, 2725]
  ];

  const f = {
    number: (id, label, value, unit, units, help = "") => ({ id, label, value, unit, units, type: "number", help }),
    select: (id, label, value, options, help = "") => ({ id, label, value, options, type: "select", help })
  };

  const tools = [
    {
      id: "steam-velocity", group: "蒸汽 / 管道设计", title: "管道中蒸汽流速",
      fields: pipeFields().concat([f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("flow", "蒸汽流量", 1000, "kg/h", flowUnits())]),
      equation: "v = 4 x ms x V / (3600 x pi x d^2)",
      calc: (v) => {
        const d = pipeDiameter(v);
        const p = pressureAbs(v.pressure, v.pressureUnit);
        const ms = massFlow(v.flow, v.flowUnit);
        const s = steamAtPressure(p);
        const velocity = 4 * ms * s.vg / (3600 * Math.PI * d * d);
        return result("蒸汽流速", velocity, "m/s", [["管道内径", d * 1000, "mm"], ["蒸汽比容", s.vg, "m3/kg"], ["饱和温度", s.t, "degC"], ["绝对压力", p, "bar abs"]]);
      }
    },
    {
      id: "steam-flow", group: "蒸汽 / 管道设计", title: "管道中蒸汽流量",
      fields: pipeFields().concat([f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("velocity", "蒸汽流速", 25, "m/s", velocityUnits())]),
      equation: "ms = v x 3600 x pi x d^2 / (4 x V)",
      calc: (v) => {
        const d = pipeDiameter(v);
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const vel = velocityMS(v.velocity, v.velocityUnit);
        const ms = vel * 3600 * Math.PI * d * d / (4 * s.vg);
        return result("蒸汽流量", ms, "kg/h", [["管道内径", d * 1000, "mm"], ["蒸汽比容", s.vg, "m3/kg"], ["饱和温度", s.t, "degC"]]);
      }
    },
    {
      id: "steam-size-pressure-loss", group: "蒸汽 / 管道设计", title: "管道选型（基于压降）",
      fields: [
        f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES),
        f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()),
        f.number("flow", "蒸汽流量", 1000, "kg/h", flowUnits()),
        f.number("maxDp", "最大允许压损", 1, "bar", pressureDropUnits()),
        f.number("length", "管道长度", 100, "m", lengthUnits()),
        f.number("globe", "截止阀（个）", 0, "", [""]),
        f.number("gate", "闸阀（个）", 0, "", [""]),
        f.number("check", "止回阀（个）", 0, "", [""]),
        f.number("elbow", "弯管（个）", 0, "", [""]),
        f.number("rough", "管道粗糙度", 0.05, "mm", diameterUnits())
      ],
      equation: "select first DN where dp <= allowable dp",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const selected = selectPipeByPressureLoss(v, s, pressureDropBarValue(v.maxDp, v.maxDpUnit));
        return result("管径", selected.size, "", [["管道内径", selected.diameterMm, "mm"], ["蒸汽流速", selected.velocity, "m/s"], ["压损", selected.dp, "bar"], ["管道长度当量值", selected.equivalentLength, "m"]]);
      }
    },
    {
      id: "steam-size-velocity", group: "蒸汽 / 管道设计", title: "管道选型（基于流速）",
      fields: [
        f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES),
        f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()),
        f.number("flow", "蒸汽流量", 1000, "kg/h", flowUnits()),
        f.number("velocity", "最大允许流速", 30, "m/s", velocityUnits()),
        f.number("length", "管道长度", 100, "m", lengthUnits()),
        f.number("globe", "截止阀（个）", 0, "", [""]),
        f.number("gate", "闸阀（个）", 0, "", [""]),
        f.number("check", "止回阀（个）", 0, "", [""]),
        f.number("elbow", "弯管（个）", 0, "", [""]),
        f.number("rough", "管道粗糙度", 0.05, "mm", diameterUnits())
      ],
      equation: "d = sqrt(4 x ms x V / (3600 x pi x vmax)); dp = f x Le / d x rho x v^2 / 2",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const ms = massFlow(v.flow, v.flowUnit);
        const vmax = velocityMS(v.velocity, v.velocityUnit);
        const requiredMm = Math.sqrt(4 * ms * s.vg / (3600 * Math.PI * vmax)) * 1000;
        const selected = selectPipeByVelocity(v.pipeClass, requiredMm);
        const d = selected.diameterMm / 1000;
        const actualVelocity = 4 * ms * s.vg / (3600 * Math.PI * d * d);
        const le = equivalentLength(lengthM(v.length, v.lengthUnit), d, v);
        const dp = pressureDropBar(d, le, actualVelocity, 1 / s.vg, diameterM(v.rough, v.roughUnit || "mm"));
        return result("管径", selected.size, "", [["管道内径", selected.diameterMm, "mm"], ["蒸汽流速", actualVelocity, "m/s"], ["压损", dp, "bar"], ["管道长度当量值", le, "m"]]);
      }
    },
    {
      id: "steam-pressure-loss", group: "蒸汽 / 管道设计", title: "管道压损",
      fields: pipeFields().concat([
        f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()),
        f.number("flow", "蒸汽流量", 1000, "kg/h", flowUnits()),
        f.number("length", "管道长度", 100, "m", lengthUnits()),
        f.number("globe", "截止阀（个）", 0, "", [""]),
        f.number("gate", "闸阀（个）", 0, "", [""]),
        f.number("check", "止回阀（个）", 0, "", [""]),
        f.number("elbow", "弯管（个）", 0, "", [""]),
        f.number("rough", "管道粗糙度", 0.05, "mm", diameterUnits())
      ]),
      equation: "dp = f x L / d x rho x v^2 / 2",
      calc: (v) => {
        const d = pipeDiameter(v), p = pressureAbs(v.pressure, v.pressureUnit), s = steamAtPressure(p);
        const vel = 4 * massFlow(v.flow, v.flowUnit) * s.vg / (3600 * Math.PI * d * d);
        const le = equivalentLength(lengthM(v.length, v.lengthUnit), d, v);
        const dp = pressureDropBar(d, le, vel, 1 / s.vg, diameterM(v.rough, v.roughUnit || "mm"));
        return result("压损", dp, "bar", [["蒸汽流速", vel, "m/s"], ["管道长度当量值", le, "m"], ["管道内径", d * 1000, "mm"], ["密度", 1 / s.vg, "kg/m3"]]);
      }
    },
    {
      id: "steam-valve-flow", group: "蒸汽 / 阀门和孔板", title: "流经阀门时蒸汽流量",
      fields: [f.number("cv", "阀门系数", 10, "Kv", valveCoeffUnits()), f.number("p1", "一次压力", 7, "barG", pressureUnits()), f.number("p2", "二次压力", 5, "barG", pressureUnits())],
      equation: "ms = C x Kv x Y x sqrt(x x p1 x rho); xT = 0.72",
      calc: (v) => {
        const p1 = pressureAbs(v.p1, v.p1Unit), p2 = pressureAbs(v.p2, v.p2Unit);
        const kv = valveCoeffKv(v.cv, v.cvUnit);
        const basis = steamValveBasis(p1, p2);
        const flow = kv * basis.factor;
        return result("蒸汽流量", flow, "kg/h", [["Kv", kv, ""], ["压差比 x", basis.x, ""], ["膨胀系数 Y", basis.y, ""], ["入口密度", basis.rho, "kg/m3"]]);
      }
    },
    {
      id: "steam-orifice-flow", group: "蒸汽 / 阀门和孔板", title: "流经孔板时蒸汽流量",
      fields: [f.number("p1", "一次压力", 7, "barG", pressureUnits()), f.number("p2", "二次压力", 5, "barG", pressureUnits()), f.number("diameter", "孔板直径", 20, "mm", diameterUnits())],
      equation: "ms = Cd x A x Y x sqrt(x x p1 x rho); xT = 0.72",
      calc: (v) => {
        const p1 = pressureAbs(v.p1, v.p1Unit), p2 = pressureAbs(v.p2, v.p2Unit);
        const d = diameterM(v.diameter, v.diameterUnit);
        const basis = steamOrificeBasis(p1, p2, d);
        return result("蒸汽流量", basis.flow, "kg/h", [["孔面积", basis.area * 1e6, "mm2"], ["压差比 x", basis.x, ""], ["膨胀系数 Y", basis.y, ""], ["入口密度", basis.rho, "kg/m3"]]);
      }
    },
    {
      id: "valve-cv", group: "蒸汽 / 阀门和孔板", title: "Cv & Kvs 值",
      fields: [f.number("flow", "蒸汽流量", 1000, "kg/h", flowUnits()), f.number("p1", "入口压力", 7, "barG", pressureUnits()), f.number("p2", "出口压力", 5, "barG", pressureUnits())],
      equation: "Kv = ms / (C x Y x sqrt(x x p1 x rho)); xT = 0.72",
      calc: (v) => {
        const p1 = pressureAbs(v.p1, v.p1Unit), p2 = pressureAbs(v.p2, v.p2Unit);
        const basis = steamValveBasis(p1, p2);
        const kv = massFlow(v.flow, v.flowUnit) / basis.factor;
        return result("Kv", kv, "", [["Cv(US)", kv / 0.865, ""], ["Cv(UK)", kv / 0.9639, ""], ["压差比 x", basis.x, ""], ["膨胀系数 Y", basis.y, ""]]);
      }
    },
    {
      id: "cond-pipe-start", group: "蒸汽 / 冷凝水负荷", title: "系统启动时管道冷凝水负荷",
      fields: [
        f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES),
        f.select("nominalSize", "管径", "DN80", NOMINAL_SIZES),
        f.select("insulation", "保温", "岩棉", insulationTypes()),
        f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()),
        f.number("thickness", "保温层厚度", 50, "mm", diameterUnits()),
        f.number("length", "管道长度", 100, "m", lengthUnits()),
        f.number("minutes", "启动时间", 30, "min", timeUnits())
      ],
      equation: "m = m_warmup + m_radiation; warmup by steel heat capacity, radiation by insulation loss",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const len = lengthM(v.length, v.lengthUnit);
        const minutes = timeMinutes(v.minutes, v.minutesUnit);
        const calc = condensatePipingStart(v, s, len, minutes);
        return result("冷凝水负载", calc.total, "kg", [["暖管产生的冷凝水量", calc.warmup, "kg"], ["辐射散热产生的冷凝水量", calc.radiation, "kg"], ["启动时间", minutes, "min"], ["饱和温度", s.t, "degC"]]);
      }
    },
    {
      id: "cond-liquid-cont", group: "蒸汽 / 冷凝水负荷", title: "加热液体（连续）",
      fields: [f.select("fluid", "流体种类", "淡水", liquidTypes()), f.number("liquidFlow", "液体流量", 1, "m3/h", liquidVolumeFlowUnits()), f.number("tin", "液体入口温度", 20, "degC", tempUnits()), f.number("tout", "液体出口温度", 80, "degC", tempUnits()), f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits())],
      equation: "ms = Qv x rho x Cp x (Tout - Tin) / hfg",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const props = liquidProps(v.fluid);
        const qv = liquidVolumeFlowM3H(v.liquidFlow, v.liquidFlowUnit);
        const tin = temperatureC(v.tin, v.tinUnit);
        const tout = temperatureC(v.tout, v.toutUnit);
        const load = qv * props.rho * props.cp * Math.max(tout - tin, 0) / s.hfg;
        return result("冷凝水负载", load, "kg/h", [["热负荷", load * s.hfg / 3600, "kW"], ["密度", props.rho, "kg/m3"], ["比热", props.cp, "kJ/kgK"], ["汽化潜热", s.hfg, "kJ/kg"]]);
      }
    },
    {
      id: "cond-liquid-batch", group: "蒸汽 / 冷凝水负荷", title: "加热液体（批次）",
      fields: [f.select("fluid", "流体种类", "淡水", liquidTypes()), f.number("tin", "液体入口温度", 20, "degC", tempUnits()), f.number("tout", "液体出口温度", 80, "degC", tempUnits()), f.number("volume", "液体体积", 1, "m3", liquidVolumeUnits()), f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("minutes", "加热时长", 60, "min", timeUnits())],
      equation: "m = V x rho x Cp x (Tout - Tin) / hfg; average = m / t",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const props = liquidProps(v.fluid);
        const volume = liquidVolumeM3(v.volume, v.volumeUnit);
        const tin = temperatureC(v.tin, v.tinUnit);
        const tout = temperatureC(v.tout, v.toutUnit);
        const hours = timeMinutes(v.minutes, v.minutesUnit) / 60;
        const load = volume * props.rho * props.cp * Math.max(tout - tin, 0) / s.hfg;
        return result("冷凝水负载", load, "kg", [["冷凝水负载平均值", load / Math.max(hours, 1e-9), "kg/h"], ["密度", props.rho, "kg/m3"], ["比热", props.cp, "kJ/kgK"], ["汽化潜热", s.hfg, "kJ/kg"]]);
      }
    },
    {
      id: "cond-air", group: "蒸汽 / 冷凝水负荷", title: "加热空气",
      fields: [f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("airFlow", "空气流量（实际）", 10, "m3/min", airVolumeFlowUnits()), f.number("tin", "空气入口温度", 10, "degC", tempUnits()), f.number("tout", "空气出口温度", 60, "degC", tempUnits())],
      equation: "ms = Qv(actual) x rho_air(Tin) x Cp x (Tout - Tin) / hfg",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const tin = temperatureC(v.tin, v.tinUnit);
        const tout = temperatureC(v.tout, v.toutUnit);
        const qv = airVolumeFlowM3H(v.airFlow, v.airFlowUnit);
        const rho = airDensityAtC(tin);
        const load = qv * rho * AIR_CP * Math.max(tout - tin, 0) / s.hfg;
        return result("冷凝水负载", load, "kg/h", [["热负荷", load * s.hfg / 3600, "kW"], ["空气密度", rho, "kg/m3"], ["空气比热", AIR_CP, "kJ/kgK"], ["汽化潜热", s.hfg, "kJ/kg"]]);
      }
    },
    {
      id: "dryness-pr", group: "蒸汽 / 提高蒸汽干燥度", title: "通过减压提高干燥度",
      fields: [f.number("p1", "一次压力", 10, "barG", pressureUnits()), f.number("p2", "二次压力", 5, "barG", pressureUnits()), f.number("x1", "一次蒸汽干燥度估值", 95, "%", ["%"])],
      equation: "h1 = hf1 + (x1 / 100) hfg1; x2 = (h1 - hf2) / hfg2",
      calc: (v) => {
        const s1 = steamAtPressure(pressureAbs(v.p1, v.p1Unit)), s2 = steamAtPressure(pressureAbs(v.p2, v.p2Unit));
        const x1 = Number(v.x1) / 100;
        const h1 = s1.hf + x1 * s1.hfg;
        const x2 = (h1 - s2.hf) / s2.hfg;
        const superheat = Math.max((h1 - s2.hg) / STEAM_CP_SUPERHEAT, 0);
        const dryness = Math.min(x2 * 100, 100);
        return result("二次蒸汽干燥度", dryness, "%", [["二次压力", s2.p - ATM_BAR, "barG"], ["过热度", superheat, "degC"], ["一次蒸汽焓", h1, "kJ/kg"], ["改善幅度", dryness - Number(v.x1), "%"]]);
      }
    },
    {
      id: "dryness-separator", group: "蒸汽 / 提高蒸汽干燥度", title: "通过减压和汽水分离提高干燥度",
      fields: [f.number("p1", "一次压力", 10, "barG", pressureUnits()), f.number("p2", "二次压力", 5, "barG", pressureUnits()), f.number("flow", "蒸汽流量", 1000, "kg/h", flowUnits()), f.number("eff", "汽水分离效率", 98, "%", ["%"]), f.number("condensate", "分离出的冷凝水量", 50, "kg/h", flowUnits())],
      equation: "X1 = 1 - mc / (ms x etas); Xsep = X1 ms / (ms - mc); X2 = (hsep - hf2) / hfg2",
      calc: (v) => {
        const s1 = steamAtPressure(pressureAbs(v.p1, v.p1Unit)), s2 = steamAtPressure(pressureAbs(v.p2, v.p2Unit));
        const ms = massFlow(v.flow, v.flowUnit);
        const mc = massFlow(v.condensate, v.condensateUnit);
        const eta = Number(v.eff) / 100;
        if (ms <= 0 || mc < 0 || eta <= 0 || mc >= ms) throw new Error("蒸汽流量、冷凝水量或分离效率超出有效范围。");
        const x1 = 1 - mc / (ms * eta);
        const h1 = s1.hf + x1 * s1.hfg;
        const xReduced = (h1 - s2.hf) / s2.hfg;
        const xSeparated = xReduced / (xReduced + (1 - xReduced) * (1 - eta));
        const drySuperheat = Math.max((s1.hg - s2.hg) / STEAM_CP_SUPERHEAT, 0);
        const dropRatio = Math.max((s1.p - s2.p) / s1.p, 0);
        const moistureDamp = Math.max(0, 1 - Math.max(1 - x1, 0) * Math.max(3.176 - 3.19 * dropRatio, 0));
        const efficiencyFactor = Math.min(Math.max((eta - 0.78) / 0.2, 0), 1);
        const superheat = drySuperheat * 0.24 * moistureDamp * efficiencyFactor;
        const dryness = superheat > 0 ? 100.001 : xSeparated * 100;
        return result("二次蒸汽干燥度", dryness, "%", [["二次压力", s2.p - ATM_BAR, "barG"], ["一次蒸汽干燥度估值", x1 * 100, "%"], ["饱和蒸汽温度", s2.t, "degC"], ["过热度", superheat, "degC"], ["分离后干燥度", xSeparated * 100, "%"]]);
      }
    },
    {
      id: "air-mixture-temp", group: "蒸汽 / 混合空气影响", title: "温降（其中空气%）",
      fields: [f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("airPct", "空气占总体积", 10, "%", ["%"])],
      equation: "ps = p x (1 - a / 100); dT = Tsat(p) - Tsat(ps)",
      calc: (v) => {
        const pTotal = pressureAbs(v.pressure, v.pressureUnit);
        const sPure = steamAtPressure(pTotal);
        const pSteam = pTotal * (1 - Number(v.airPct) / 100);
        const sMix = steamAtPressure(pSteam);
        return result("温降", sPure.t - sMix.t, "degC", [["混合温度", sMix.t, "degC"], ["蒸发分压力", pSteam, "bar abs"], ["饱和蒸汽温度", sPure.t, "degC"]]);
      }
    },
    {
      id: "air-mixture-pct", group: "蒸汽 / 混合空气影响", title: "空气%（基于混合温度）",
      fields: [f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("temperature", "混合温度", 160, "degC", tempUnits())],
      equation: "a = (1 - ps / p) x 100",
      calc: (v) => {
        const pTotal = pressureAbs(v.pressure, v.pressureUnit);
        const sPure = steamAtPressure(pTotal);
        const mixedTemp = temperatureC(v.temperature, v.temperatureUnit);
        const pSteam = pressureAtTemp(mixedTemp);
        return result("空气占总体积", Math.max(0, (1 - pSteam / pTotal) * 100), "%", [["蒸发分压力", pSteam, "bar abs"], ["饱和蒸汽温度", sPure.t, "degC"], ["温降", sPure.t - mixedTemp, "degC"]]);
      }
    },
    {
      id: "steam-cost", group: "蒸汽 / 单位蒸汽&能源成本", title: "单位蒸汽成本",
      fields: [f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("feedwater", "锅炉给水温度", 85, "degC", tempUnits()), f.number("energyCost", "单位能源成本", 0.10905, "RMB/MJ", energyCostUnits())],
      equation: "Cs = (hs - hfw) x Ce",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const feedTemp = temperatureC(v.feedwater, v.feedwaterUnit);
        const hfw = WATER_CP * feedTemp;
        const ce = energyCostRmbMj(v.energyCost, v.energyCostUnit);
        const cost = (s.hg - hfw) * ce;
        return result("单位蒸汽成本", cost, "RMB/ton", [["蒸汽热焓", s.hg, "kJ/kg"], ["给水热焓", hfw, "kJ/kg"], ["单位能源成本", ce, "RMB/MJ"]]);
      }
    },
    {
      id: "energy-cost", group: "蒸汽 / 单位蒸汽&能源成本", title: "单位能源成本",
      fields: [f.number("cv", "燃料热值（低值）", 35800, "kJ/kg", fuelHeatUnits()), f.number("price", "燃料单价", 3200, "RMB/ton", fuelPriceUnits()), f.number("eff", "锅炉效率", 82, "%", ["%"])],
      equation: "Ce = Cf / (Hf x eta)",
      calc: (v) => {
        const cv = fuelHeatKjKg(v.cv, v.cvUnit);
        const price = fuelPriceRmbTon(v.price, v.priceUnit);
        const cost = price / (cv * Number(v.eff) / 100);
        return result("单位能源成本", cost, "RMB/MJ", [["燃料热值（低值）", cv, "kJ/kg"], ["燃料单价", price, "RMB/ton"], ["锅炉效率", Number(v.eff), "%"]]);
      }
    },
    {
      id: "boiler-eff", group: "蒸汽 / 单位蒸汽&能源成本", title: "锅炉效率",
      fields: [f.number("pressure", "锅炉压力", 7, "barG", pressureUnits()), f.number("feedwater", "锅炉给水温度", 85, "degC", tempUnits()), f.number("feedFlow", "锅炉给水量", 1000, "kg/h", flowUnits()), f.number("cv", "燃料热值（低值）", 35800, "kJ/kg", fuelHeatUnits()), f.number("fuel", "燃料损耗", 80, "kg/h", flowUnits()), f.number("maxFlow", "额定锅炉给水流量最大值", 2000, "kg/h", flowUnits())],
      equation: "eta = mfw x (hg - hfw) / (mfl x Hf); LF = mfw / mfwmax",
      calc: (v) => {
        const s = steamAtPressure(pressureAbs(v.pressure, v.pressureUnit));
        const feedTemp = temperatureC(v.feedwater, v.feedwaterUnit);
        const feed = massFlow(v.feedFlow, v.feedFlowUnit);
        const fuel = massFlow(v.fuel, v.fuelUnit);
        const maxFlow = massFlow(v.maxFlow, v.maxFlowUnit);
        const cv = fuelHeatKjKg(v.cv, v.cvUnit);
        const hfw = WATER_CP * feedTemp;
        const blowdown = feed * 0.02;
        const useful = feed * (s.hg - hfw) - blowdown * s.hfg;
        const efficiency = useful / Math.max(fuel * cv, 1e-9) * 100;
        return result("锅炉效率", efficiency, "%", [["锅炉负载系数", feed / Math.max(maxFlow, 1e-9) * 100, "%"], ["锅炉排放率（平均）", blowdown, "kg/h"], ["蒸汽热焓", s.hg, "kJ/kg"], ["给水热焓", hfw, "kJ/kg"], ["燃料输入热量", fuel * cv, "kJ/h"]]);
      }
    },
    {
      id: "flash-steam", group: "冷凝水回收", title: "产生闪蒸汽量",
      fields: [f.number("p1", "冷凝水压力", 7, "barG", pressureUnits()), f.number("cond", "冷凝水负载", 1000, "kg/h", flowUnits()), f.number("p2", "回收管压力", 1, "barG", pressureUnits())],
      equation: "Rfs = (hc - hfc) / hfg; mfs = mc x Rfs",
      calc: (v) => {
        const s1 = steamAtPressure(pressureAbs(v.p1, v.p1Unit)), s2 = steamAtPressure(pressureAbs(v.p2, v.p2Unit));
        const pct = Math.max(0, (s1.hf - s2.hf) / s2.hfg);
        return result("闪蒸汽流量", massFlow(v.cond, v.condUnit) * pct, "kg/h", [["闪蒸汽百分比", pct * 100, "%"], ["冷凝水热焓", s1.hf, "kJ/kg"], ["饱和水热焓", s2.hf, "kJ/kg"], ["闪蒸汽潜热", s2.hfg, "kJ/kg"]]);
      }
    },
    {
      id: "recovery-size-pressure-loss", group: "冷凝水回收", title: "冷凝水回收管（基于压降）",
      fields: [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.number("p1", "冷凝水压力", 7, "barG", pressureUnits()), f.number("cond", "冷凝水负载", 1000, "kg/h", flowUnits()), f.number("p2", "回收管压力", 1, "barG", pressureUnits()), f.number("maxDp", "最大允许压损", 0.3, "bar", pressureDropUnits()), f.number("length", "管道长度", 100, "m", diameterUnits())],
      equation: "Vtemp = Rfs x vg + (1 - Rfs) x vf; v = mc x Vtemp / A",
      calc: (v) => {
        const props = recoveryLineProps(v);
        const maxDp = pressureDropBarValue(v.maxDp, v.maxDpUnit);
        const selected = selectRecoveryPipe(v.pipeClass, props, d => d.dp <= maxDp);
        return result("管径", selected.size, "", [["管道内径", selected.diameterMm, "mm"], ["冷凝水流速", selected.velocity, "m/s"], ["压损", selected.dp, "bar"], ["管道长度当量值", props.length, "m"], ["闪蒸汽百分比", props.flashPct * 100, "%"]]);
      }
    },
    {
      id: "recovery-size-velocity", group: "冷凝水回收", title: "冷凝水回收管（基于流速）",
      fields: [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.number("p1", "冷凝水压力", 7, "barG", pressureUnits()), f.number("cond", "冷凝水负载", 1000, "kg/h", flowUnits()), f.number("p2", "回收管压力", 1, "barG", pressureUnits()), f.number("length", "管道长度", 100, "m", diameterUnits()), f.number("velocity", "最大允许流速", 15, "m/s", velocityUnits())],
      equation: "Vtemp = Rfs x vg + (1 - Rfs) x vf; select d by v <= vmax",
      calc: (v) => {
        const props = recoveryLineProps(v);
        const vmax = velocityMS(v.velocity, v.velocityUnit);
        const selected = selectRecoveryPipe(v.pipeClass, props, d => d.velocity <= vmax);
        return result("管径", selected.size, "", [["管道内径", selected.diameterMm, "mm"], ["冷凝水流速", selected.velocity, "m/s"], ["压损", selected.dp, "bar"], ["管道长度当量值", props.length, "m"], ["闪蒸汽百分比", props.flashPct * 100, "%"]]);
      }
    },
    {
      id: "recovery-open-econ", group: "冷凝水回收", title: "开放式回收系统",
      fields: [f.number("steamPressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("condPressure", "冷凝水压力", 7, "barG", pressureUnits()), f.number("cond", "冷凝水负载", 1000, "kg/h", flowUnits()), f.number("feedTemp", "锅炉给水温度", 85, "degC", tempUnits()), f.number("feedFlow", "锅炉给水量", 2000, "kg/h", flowUnits()), f.number("cv", "燃料热值（低值）", 35800, "kJ/kg", fuelHeatUnits()), f.number("eff", "锅炉效率", 82, "%", ["%"]), f.number("energyCost", "单位能源成本", 0.10905, "RMB/MJ", energyCostUnits()), f.number("hours", "年运行小时", 8000, "h", timeUnits()), f.number("maxFeedTemp", "锅炉最高允许给水温度", 120, "degC", tempUnits())],
      equation: "Tm = min((mc hc + (mfw - mc) hfw) / mfw, hfwmax); Hr = mfw (Tm - hfw)",
      calc: (v) => recoveryEconomics(v, "open")
    },
    {
      id: "recovery-closed-econ", group: "冷凝水回收", title: "封闭式回收系统",
      fields: [f.number("steamPressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("condPressure", "冷凝水压力", 7, "barG", pressureUnits()), f.number("cond", "冷凝水负载", 1000, "kg/h", flowUnits()), f.number("recoveryPressure", "回收管压力", 1, "barG", pressureUnits()), f.number("feedTemp", "锅炉给水温度", 85, "degC", tempUnits()), f.number("feedFlow", "锅炉给水量", 2000, "kg/h", flowUnits()), f.number("cv", "燃料热值（低值）", 35800, "kJ/kg", fuelHeatUnits()), f.number("eff", "锅炉效率", 82, "%", ["%"]), f.number("energyCost", "单位能源成本", 0.10905, "RMB/MJ", energyCostUnits()), f.number("hours", "年运行小时", 8000, "h", timeUnits())],
      equation: "Hr = mc x (hc - hfw)",
      calc: (v) => recoveryEconomics(v, "closed")
    },
    {
      id: "recovery-flash-econ", group: "冷凝水回收", title: "闪蒸汽回收",
      fields: [f.number("steamPressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("condPressure", "冷凝水压力", 7, "barG", pressureUnits()), f.number("cond", "冷凝水负载", 1000, "kg/h", flowUnits()), f.number("feedTemp", "锅炉给水温度", 85, "degC", tempUnits()), f.number("feedFlow", "锅炉给水量", 2000, "kg/h", flowUnits()), f.number("cv", "燃料热值（低值）", 35800, "kJ/kg", fuelHeatUnits()), f.number("eff", "锅炉效率", 82, "%", ["%"]), f.number("energyCost", "单位能源成本", 0.10905, "RMB/MJ", energyCostUnits()), f.number("rawTemp", "原水温度", 20, "degC", tempUnits()), f.number("hours", "年运行小时", 8000, "h", timeUnits()), f.number("flashPressure", "闪蒸汽压力", 1, "barG", pressureUnits())],
      equation: "mfs = mc x (hc - hfc) / hfg; Hr = mfs x (hg - hrw)",
      calc: (v) => recoveryEconomics(v, "flash")
    },
    {
      id: "steam-table-pressure", group: "蒸汽表", title: "饱和蒸汽表（基于压力）",
      fields: [f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits())],
      equation: "按饱和蒸汽表插值",
      calc: (v) => {
        const p = pressureAbs(v.pressure, v.pressureUnit), s = steamAtPressure(p);
        return result("饱和蒸汽温度", s.t, "degC", [["蒸汽潜热", s.hfg, "kJ/kg"], ["饱和蒸汽热焓", s.hg, "kJ/kg"], ["水的热焓", s.hf, "kJ/kg"], ["饱和蒸汽比容", s.vg, "m3/kg"], ["饱和水比容", saturatedWaterVolume(s.t), "m3/kg"]]);
      }
    },
    {
      id: "steam-table-temperature", group: "蒸汽表", title: "饱和蒸汽表（基于温度）",
      fields: [f.number("temperature", "蒸汽温度", 170, "degC", tempUnits())],
      equation: "按饱和蒸汽表反插值",
      calc: (v) => {
        const t = temperatureC(v.temperature, v.temperatureUnit);
        const p = pressureAtTemp(t), s = steamAtPressure(p);
        return result("蒸汽压力", p - ATM_BAR, "barG", [["蒸汽潜热", s.hfg, "kJ/kg"], ["饱和蒸汽热焓", s.hg, "kJ/kg"], ["水的热焓", s.hf, "kJ/kg"], ["饱和蒸汽比容", s.vg, "m3/kg"], ["饱和水比容", saturatedWaterVolume(s.t), "m3/kg"]]);
      }
    },
    {
      id: "superheated-steam-table", group: "蒸汽表", title: "过热蒸汽表",
      fields: [f.number("pressure", "蒸汽压力", 7, "barG", pressureUnits()), f.number("temperature", "蒸汽温度", 200, "degC", tempUnits())],
      equation: "h = hg + cp(T - Tsat); v = ZRT/P",
      calc: (v) => {
        const p = pressureAbs(v.pressure, v.pressureUnit);
        const s = steamAtPressure(p);
        const t = temperatureC(v.temperature, v.temperatureUnit);
        if (t <= s.t) throw new Error("过热蒸汽温度必须高于同压力下饱和温度。");
        const sh = t - s.t;
        const pGauge = p - ATM_BAR;
        const cpHeat = 2.05 + 0.015 * Math.max(pGauge, 0);
        const cp = 2.02 + 0.015 * Math.max(pGauge, 0) + 6 / (sh + 20);
        const z = 0.985 - 0.0015 * Math.max(pGauge, 0);
        const volume = Math.max(z, 0.9) * 0.4615 * (t + 273.15) / (p * 100);
        const viscosity = 0.006 + 0.000048 * t;
        const h = s.hg + cpHeat * sh;
        return result("过热蒸汽热焓", h, "kJ/kg", [["过热蒸汽比容", volume, "m3/kg"], ["过热蒸汽比热", cp, "kJ/kgK"], ["过热蒸汽粘度", viscosity, "mPa s"], ["饱和蒸汽温度", s.t, "degC"]]);
      }
    },
    {
      id: "water-velocity", group: "水", title: "管道中水的流速",
      fields: waterPipeFields().concat([f.number("liquidFlow", "液体流量", 100, "m3/h", liquidVolumeFlowUnits())]),
      equation: "v = Q / A",
      calc: (v) => {
        const d = pipeDiameter(v);
        const q = liquidVolumeFlowM3H(v.liquidFlow, v.liquidFlowUnit);
        const velocity = q / (3600 * Math.PI * d * d / 4);
        return result("水的流速", velocity, "m/s", [["管道内径", d * 1000, "mm"], ["液体流量", q, "m3/h"]]);
      }
    },
    {
      id: "water-flow", group: "水", title: "管道中水流量",
      fields: waterPipeFields().concat([f.number("velocity", "水的流速", 4.67695, "m/s", velocityUnits())]),
      equation: "Q = A v",
      calc: (v) => {
        const d = pipeDiameter(v);
        const velocity = velocityMS(v.velocity, v.velocityUnit);
        const q = velocity * Math.PI * d * d / 4 * 3600;
        return result("液体流量", q, "m3/h", [["管道内径", d * 1000, "mm"], ["水的流速", velocity, "m/s"]]);
      }
    },
    {
      id: "water-insulation", group: "水", title: "保温层厚度",
      fields: [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.select("nominalSize", "管径", "DN6", NOMINAL_SIZES), f.select("insulation", "保温", "岩棉", insulationTypes()), f.number("rh", "相对湿度", 80, "%", ["%"]), f.number("tin", "内部温度", 5, "degC", tempUnits()), f.number("tamb", "环境温度", 30, "degC", tempUnits())],
      equation: "Tdew by Magnus; thickness rounded to 5 mm step",
      calc: (v) => {
        const tin = temperatureC(v.tin, v.tinUnit);
        const tamb = temperatureC(v.tamb, v.tambUnit);
        const dew = dewPointC(tamb, Number(v.rh));
        const need = Math.max(dew - tin, 0);
        const raw = Math.max(0, 0.32 * need + 0.13 * Math.max(tamb - tin, 0) + 0.28 * (Number(v.rh) - 60));
        const material = ({ "岩棉": 1, "玻璃棉": 0.95, "硅酸钙": 1.12, "珠光体": 1.06 }[v.insulation] || 1);
        const thickness = Math.ceil(raw * material / 5) * 5;
        return result("保温层厚度", thickness, "mm", [["露点", dew, "degC"], ["内部温度", tin, "degC"], ["环境温度", tamb, "degC"]]);
      }
    },
    {
      id: "air-velocity", group: "空气 / 管道设计", title: "管道中空气流速",
      fields: airPipeFields().concat([f.number("pressure", "空气压力", 7, "barG", pressureUnits()), f.number("temperature", "空气温度", 20, "degC", tempUnits()), f.number("airFlow", "空气流量（实际）", 1, "m3/min", airVolumeFlowUnits())]),
      equation: "v = Qa / A",
      calc: (v) => {
        const d = pipeDiameter(v);
        const q = airVolumeFlowM3H(v.airFlow, v.airFlowUnit) / 3600;
        const velocity = q / (Math.PI * d * d / 4);
        return result("空气流速", velocity, "m/s", [["空气流量（实际）", q * 60, "m3/h"], ["空气流量（名义）", airActualToNormalM3Min(q, v), "Nm3/min"], ["管道内径", d * 1000, "mm"]]);
      }
    },
    {
      id: "air-flow", group: "空气 / 管道设计", title: "管道中空气流量",
      fields: airPipeFields().concat([f.number("pressure", "空气压力", 7, "barG", pressureUnits()), f.number("temperature", "空气温度", 20, "degC", tempUnits()), f.number("velocity", "空气流速", 20, "m/s", velocityUnits())]),
      equation: "Qa = A v",
      calc: (v) => {
        const d = pipeDiameter(v);
        const velocity = velocityMS(v.velocity, v.velocityUnit);
        const actual = velocity * Math.PI * d * d / 4 * 60;
        return result("空气流量（实际）", actual, "m3/min", [["空气流量（名义）", airActualToNormalM3Min(actual / 60, v), "Nm3/min"], ["管道内径", d * 1000, "mm"], ["空气流速", velocity, "m/s"]]);
      }
    },
    {
      id: "air-pressure-loss", group: "空气 / 管道设计", title: "管道中压降",
      fields: airPipeFields().concat([f.number("pressure", "空气压力", 7, "barG", pressureUnits()), f.number("temperature", "空气温度", 20, "degC", tempUnits()), f.number("airFlow", "空气流量（实际）", 1, "m3/min", airVolumeFlowUnits()), f.number("length", "管道长度", 100, "m", diameterUnits())]),
      equation: "Darcy-Weisbach with compressed-air density",
      calc: (v) => {
        const props = airPipeProps(v);
        return result("压损", props.dp, "bar", [["空气流速", props.velocity, "m/s"], ["管道长度当量值", props.length, "m"], ["管道内径", props.d * 1000, "mm"]]);
      }
    },
    {
      id: "air-size-pressure-loss", group: "空气 / 管道设计", title: "管道设计（基于压降）",
      fields: [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.number("pressure", "空气压力", 7, "barG", pressureUnits()), f.number("temperature", "空气温度", 20, "degC", tempUnits()), f.number("airFlow", "空气流量（实际）", 1, "m3/min", airVolumeFlowUnits()), f.number("maxDp", "最大允许压损", 0.3, "bar", pressureDropUnits()), f.number("length", "管道长度", 100, "m", diameterUnits())],
      equation: "select smallest pipe with dp <= max dp",
      calc: (v) => {
        const maxDp = pressureDropBarValue(v.maxDp, v.maxDpUnit);
        const selected = selectAirPipe(v, d => d.dp <= maxDp);
        return result("管径", selected.size, "", [["管道内径", selected.diameterMm, "mm"], ["空气流速", selected.velocity, "m/s"], ["压损", selected.dp, "bar"], ["管道长度当量值", lengthM(v.length, v.lengthUnit), "m"]]);
      }
    },
    {
      id: "air-size-velocity", group: "空气 / 管道设计", title: "管道设计（基于流速）",
      fields: [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.number("pressure", "空气压力", 7, "barG", pressureUnits()), f.number("temperature", "空气温度", 20, "degC", tempUnits()), f.number("airFlow", "空气流量（实际）", 1, "m3/min", airVolumeFlowUnits()), f.number("length", "管道长度", 100, "m", diameterUnits()), f.number("velocity", "最大允许流速", 20, "m/s", velocityUnits())],
      equation: "select smallest pipe with v <= vmax",
      calc: (v) => {
        const vmax = velocityMS(v.velocity, v.velocityUnit);
        const selected = selectAirPipe(v, d => d.velocity <= vmax);
        return result("管径", selected.size, "", [["管道内径", selected.diameterMm, "mm"], ["空气流速", selected.velocity, "m/s"], ["压损", selected.dp, "bar"], ["管道长度当量值", lengthM(v.length, v.lengthUnit), "m"]]);
      }
    }
  ];

  const VALIDATED_TOOLS = new Set(["steam-velocity", "steam-flow", "steam-size-pressure-loss", "steam-size-velocity", "steam-pressure-loss", "steam-valve-flow", "steam-orifice-flow", "valve-cv", "cond-pipe-start", "cond-liquid-cont", "cond-liquid-batch", "cond-air", "dryness-pr", "dryness-separator", "air-mixture-temp", "air-mixture-pct", "energy-cost", "steam-cost", "boiler-eff", "flash-steam", "recovery-size-pressure-loss", "recovery-size-velocity", "recovery-open-econ", "recovery-closed-econ", "recovery-flash-econ", "steam-table-pressure", "steam-table-temperature", "superheated-steam-table", "water-velocity", "water-flow", "water-insulation", "air-velocity", "air-flow", "air-pressure-loss", "air-size-pressure-loss", "air-size-velocity"]);

  const UI_TEXT = {
    en: {
      navCalculator: "Calculator", navFormula: "Formula", heroEyebrow: "Engineering calculation toolbox",
      heroTitle: "Steam and Condensate Engineering Calculator",
      heroCopy: "Covers steam piping design, valves and orifices, condensate load, steam dryness, air influence, energy cost, boiler efficiency, flash steam, air piping, water systems, and steam tables.",
      toolCountLabel: "Available tools", heroCardCopy: "Inputs, results, formulas, and suggested values are organized in one engineering workspace.",
      menuTitle: "Calculator directory", print: "Print", unit: "Unit", result: "Result", formula: "Formula",
      search: "Search tools", calculate: "Calculate", clear: "Clear", empty: "Enter values and calculate.",
      checked: "Checked", pending: "Pending", unable: "Unable to calculate", recommendation: "Suggested value",
      standard: "Typical engineering reference", noRecommendation: "No general reference range. Check project specification and equipment data.",
      note: "For high-pressure, superheated steam, two-phase flow, or safety-critical applications, review against project standards and manufacturer data."
    },
    zh: {
      navCalculator: "计算器", navFormula: "公式", heroEyebrow: "Engineering calculation toolbox",
      heroTitle: "蒸汽与冷凝水工程计算工具",
      heroCopy: "覆盖蒸汽管道设计、阀门/孔板、冷凝水负荷、蒸汽干燥度、混合空气影响、单位能源成本、锅炉效率、闪蒸汽、空气管道、水系统和蒸汽表。",
      toolCountLabel: "已实现工具", heroCardCopy: "输入、结果、公式说明和建议值集中在同一工作台，便于快速复核工程参数。",
      menuTitle: "计算目录", print: "打印", unit: "单位", result: "结果", formula: "公式",
      search: "搜索工具", calculate: "计算", clear: "清除", empty: "请输入相关数值。",
      checked: "已检查", pending: "待检查", unable: "无法计算", recommendation: "建议数值",
      standard: "常用工程参考", noRecommendation: "暂无通用参考区间，请按项目规范和设备资料复核。",
      note: "高压、过热蒸汽、两相流、强安全相关场景仍应按项目标准和制造商资料复核。"
    }
  };

  const TOOL_EN = {
    "steam-velocity": ["Steam / Pipe Design", "Steam Velocity through Piping"],
    "steam-flow": ["Steam / Pipe Design", "Steam Flow Rate through Piping"],
    "steam-size-pressure-loss": ["Steam / Pipe Design", "Pipe Sizing by Pressure Loss"],
    "steam-size-velocity": ["Steam / Pipe Design", "Pipe Sizing by Velocity"],
    "steam-pressure-loss": ["Steam / Pipe Design", "Steam Pressure Loss through Piping"],
    "steam-valve-flow": ["Steam / Valves and Orifices", "Steam Flow through Valve"],
    "steam-orifice-flow": ["Steam / Valves and Orifices", "Steam Flow through Orifice"],
    "valve-cv": ["Steam / Valves and Orifices", "Cv and Kvs Value"],
    "cond-pipe-start": ["Steam / Condensate Load", "Condensate Load from Piping at Start-up"],
    "cond-liquid-cont": ["Steam / Condensate Load", "Heating Liquid - Continuous"],
    "cond-liquid-batch": ["Steam / Condensate Load", "Heating Liquid - Batch"],
    "cond-air": ["Steam / Condensate Load", "Heating Air"],
    "dryness-pr": ["Steam / Steam Dryness", "Dryness Improvement by Pressure Reduction"],
    "dryness-separator": ["Steam / Steam Dryness", "Dryness Improvement by Separator"],
    "air-mixture-temp": ["Steam / Air Influence", "Temperature Drop by Air Content"],
    "air-mixture-pct": ["Steam / Air Influence", "Air Content from Mixed Temperature"],
    "energy-cost": ["Steam / Cost and Boiler", "Unit Energy Cost"],
    "steam-cost": ["Steam / Cost and Boiler", "Unit Steam Cost"],
    "boiler-eff": ["Steam / Cost and Boiler", "Boiler Efficiency"],
    "flash-steam": ["Condensate Recovery", "Flash Steam Quantity"],
    "recovery-size-pressure-loss": ["Condensate Recovery", "Recovery Pipe by Pressure Loss"],
    "recovery-size-velocity": ["Condensate Recovery", "Recovery Pipe by Velocity"],
    "recovery-open-econ": ["Condensate Recovery", "Open Recovery Economy"],
    "recovery-closed-econ": ["Condensate Recovery", "Closed Recovery Economy"],
    "recovery-flash-econ": ["Condensate Recovery", "Flash Steam Recovery Economy"],
    "steam-table-pressure": ["Steam Table", "Saturated Steam Table by Pressure"],
    "steam-table-temperature": ["Steam Table", "Saturated Steam Table by Temperature"],
    "superheated-steam-table": ["Steam Table", "Superheated Steam Table"],
    "water-velocity": ["Water / Pipe Design", "Water Velocity through Piping"],
    "water-flow": ["Water / Pipe Design", "Water Flow Rate through Piping"],
    "water-insulation": ["Water", "Insulation Thickness for Water System"],
    "air-velocity": ["Air / Pipe Design", "Air Velocity through Piping"],
    "air-flow": ["Air / Pipe Design", "Air Flow Rate through Piping"],
    "air-pressure-loss": ["Air / Pipe Design", "Air Pressure Loss through Piping"],
    "air-size-pressure-loss": ["Air / Pipe Design", "Air Pipe Sizing by Pressure Loss"],
    "air-size-velocity": ["Air / Pipe Design", "Air Pipe Sizing by Velocity"]
  };

  const LABEL_EN = {
    "管材等级": "Pipe class", "管径": "Nominal size", "管道内径": "Pipe ID", "蒸汽压力": "Steam pressure",
    "蒸汽流量": "Steam flow", "蒸汽流速": "Steam velocity", "最大允许压损": "Max. pressure loss",
    "管道长度": "Pipe length", "截止阀（个）": "Globe valves", "闸阀（个）": "Gate valves",
    "止回阀（个）": "Check valves", "弯管（个）": "Elbows", "管道粗糙度": "Pipe roughness",
    "最大允许流速": "Max. velocity", "压损": "Pressure loss", "管道长度当量值": "Equivalent length",
    "蒸汽比容": "Steam specific volume", "饱和温度": "Saturation temperature", "绝对压力": "Absolute pressure",
    "一次压力": "Primary pressure", "二次压力": "Secondary pressure", "入口压力": "Inlet pressure",
    "出口压力": "Outlet pressure", "阀门系数": "Valve coefficient", "孔板直径": "Orifice diameter",
    "液体种类": "Liquid", "液体流量": "Liquid flow", "液体入口温度": "Liquid inlet temperature",
    "液体出口温度": "Liquid outlet temperature", "液体体积": "Liquid volume", "加热时长": "Heating time",
    "空气流量（实际）": "Air flow (actual)", "空气流量": "Air flow", "空气压力": "Air pressure",
    "空气温度": "Air temperature", "空气流速": "Air velocity", "冷凝水压力": "Condensate pressure",
    "冷凝水负载": "Condensate load", "回收管压力": "Recovery pipe pressure", "冷凝水负荷": "Condensate load",
    "保温": "Insulation", "保温层厚度": "Insulation thickness", "启动时间": "Start-up time",
    "相对湿度": "Relative humidity", "水入口温度": "Water inlet temperature", "环境温度": "Ambient temperature",
    "水流量": "Water flow", "水流速": "Water velocity", "管径": "Pipe size", "热负荷": "Heat duty",
    "密度": "Density", "比热": "Specific heat", "汽化潜热": "Latent heat", "露点温度": "Dew point",
    "表面温度余量": "Surface temperature margin", "空气名义流量": "Air normal flow", "压降": "Pressure drop",
    "燃料低位热值": "Fuel heating value", "燃料单价": "Fuel price", "锅炉效率": "Boiler efficiency",
    "给水温度": "Feedwater temperature", "能源单价": "Energy cost", "锅炉给水流量": "Boiler feedwater flow",
    "燃料消耗量": "Fuel consumption", "锅炉最大蒸发量": "Max. boiler evaporation", "闪蒸汽流量": "Flash steam flow",
    "闪蒸汽百分比": "Flash steam percentage"
  };

  const els = {
    menu: document.getElementById("toolMenu"), form: document.getElementById("calculatorForm"), result: document.getElementById("resultOutput"),
    title: document.getElementById("toolTitle"), group: document.getElementById("toolGroup"), equation: document.getElementById("equationOutput"),
    validation: document.getElementById("validationOutput"), search: document.getElementById("toolSearch"), unitGroup: document.getElementById("unitGroup"),
    count: document.getElementById("toolCount"), langToggle: document.getElementById("langToggle"), printBtn: document.getElementById("printBtn")
  };
  let active = tools[0];
  let lang = "en";

  function init() {
    els.count.textContent = tools.length;
    els.search.addEventListener("input", renderMenu);
    els.unitGroup.addEventListener("change", renderForm);
    els.langToggle.addEventListener("click", () => setLanguage(lang === "en" ? "zh" : "en"));
    els.printBtn.addEventListener("click", printCurrent);
    window.addEventListener("afterprint", () => document.body.classList.remove("print-mode"));
    setLanguage("en");
    renderMenu();
    selectTool(active.id);
    renderValidation();
  }

  function renderMenu() {
    const q = els.search.value.trim().toLowerCase();
    const visible = tools.filter(t => (`${t.group} ${t.title} ${toolGroup(t)} ${toolTitle(t)}`).toLowerCase().includes(q));
    const groups = [...new Set(visible.map(t => toolGroup(t)))];
    els.menu.innerHTML = groups.map(g => `
      <section class="menu-group">
        <h3>${g}</h3>
        ${visible.filter(t => toolGroup(t) === g).map(t => `<button type="button" data-id="${t.id}" class="${t.id === active.id ? "active" : ""}">${toolTitle(t)}<small>${VALIDATED_TOOLS.has(t.id) ? ui("checked") : ui("pending")}</small></button>`).join("")}
      </section>
    `).join("");
    els.menu.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => selectTool(btn.dataset.id)));
  }

  function selectTool(id) {
    active = tools.find(t => t.id === id) || tools[0];
    els.title.textContent = toolTitle(active);
    els.group.textContent = toolGroup(active);
    renderMenu();
    renderForm();
    renderEquation();
  }

  function renderForm() {
    els.form.innerHTML = active.fields.map(field => {
      if (field.type === "select") {
        return `<label class="control"><span>${labelText(field.label)}</span><select name="${field.id}">${field.options.map(o => `<option ${o === field.value ? "selected" : ""}>${o}</option>`).join("")}</select>${field.help ? `<small>${helpText(field.help)}</small>` : ""}</label>`;
      }
      const units = normalizeUnits(field.units, field.unit);
      return `<label class="control"><span>${labelText(field.label)}</span><div class="with-unit"><input type="number" step="any" name="${field.id}" value="${field.value}"><select name="${field.id}Unit">${units.map(u => `<option ${u === defaultUnit(field.unit) ? "selected" : ""}>${u}</option>`).join("")}</select></div>${field.help ? `<small>${helpText(field.help)}</small>` : ""}</label>`;
    }).join("") + `<div class="actions"><button class="primary-btn" type="submit">${ui("calculate")}</button><button class="secondary-btn" type="button" id="clearBtn">${ui("clear")}</button></div>`;
    els.form.onsubmit = (event) => { event.preventDefault(); calculate(); };
    document.getElementById("clearBtn").onclick = () => {
      els.form.reset();
      els.result.className = "empty-result";
      els.result.textContent = ui("empty");
    };
  }

  function calculate() {
    const values = Object.fromEntries(new FormData(els.form).entries());
    try {
      renderResult(active.calc(values));
    } catch (error) {
      els.result.className = "empty-result error";
      els.result.textContent = `${ui("unable")}: ${error.message}`;
    }
  }

  function renderResult(r) {
    els.result.className = "result-content";
    const suggestion = recommendationFor(active, r);
    els.result.innerHTML = `<div class="result-value"><span>${labelText(r.label)}</span><strong>${fmt(r.value, 4)}</strong><em>${r.unit}</em></div><article class="suggestion-card"><span>${ui("recommendation")}</span><strong>${suggestion.value}</strong><p>${suggestion.note}</p></article><dl class="result-details">${r.rows.map(row => `<div><dt>${labelText(row[0])}</dt><dd>${fmt(row[1], 4)} ${row[2] || ""}</dd></div>`).join("")}</dl>`;
  }

  function renderEquation() {
    els.equation.innerHTML = `<div class="formula">${active.equation}</div><p class="note">${ui("note")}</p>`;
  }

  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = next === "en" ? "en" : "zh-CN";
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = ui(el.dataset.i18n); });
    els.langToggle.textContent = next === "en" ? "中文" : "EN";
    els.search.placeholder = ui("search");
    els.result.textContent = els.result.classList.contains("empty-result") ? ui("empty") : els.result.textContent;
    if (active) {
      els.title.textContent = toolTitle(active);
      els.group.textContent = toolGroup(active);
      renderMenu();
      renderForm();
      renderEquation();
    }
  }

  function ui(key) { return UI_TEXT[lang][key] || UI_TEXT.en[key] || key; }
  function toolTitle(tool) { return lang === "en" && TOOL_EN[tool.id] ? TOOL_EN[tool.id][1] : tool.title; }
  function toolGroup(tool) { return lang === "en" && TOOL_EN[tool.id] ? TOOL_EN[tool.id][0] : tool.group; }
  function labelText(text) { return lang === "en" ? (LABEL_EN[text] || text) : text; }
  function helpText(text) {
    if (lang !== "en") return text;
    if (text.includes("输入 0")) return "Enter 0 to use pipe class and DN automatically.";
    if (text.includes("默认按管材")) return "Default uses pipe class and DN; manual input overrides the value.";
    return text;
  }

  function recommendationFor(tool, r) {
    const no = { value: "-", note: ui("noRecommendation") };
    const ranges = {
      "steam-velocity": ["15-30 m/s", "Saturated steam distribution lines."],
      "steam-size-velocity": ["15-30 m/s", "Common target for steam distribution sizing."],
      "steam-flow": ["15-30 m/s", "Use the velocity result when checking pipe capacity."],
      "steam-pressure-loss": ["< 0.1-0.3 bar/100 m", "Keep pressure loss aligned with system pressure margin."],
      "recovery-size-velocity": ["10-15 m/s", "Two-phase condensate return lines often require conservative velocity limits."],
      "recovery-size-pressure-loss": ["10-15 m/s", "Check selected return pipe velocity and back pressure."],
      "water-velocity": ["1-3 m/s", "Typical closed water piping reference."],
      "water-flow": ["1-3 m/s", "Use with calculated pipe velocity when selecting DN."],
      "air-velocity": ["6-10 m/s", "Common compressed-air header reference; branches may differ."],
      "air-size-velocity": ["6-10 m/s", "Common compressed-air header sizing reference."],
      "air-flow": ["6-10 m/s", "Use with calculated pipe velocity when selecting DN."],
      "air-pressure-loss": ["< 0.1 bar/100 m", "Typical target for compressed-air distribution pressure loss."],
      "air-size-pressure-loss": ["< 0.1 bar/100 m", "Check allowable pressure loss against compressor and user pressure."],
      "dryness-pr": ["> 95%", "Dry saturated steam service generally benefits from high dryness fraction."],
      "dryness-separator": ["> 98%", "Separator outlet should usually remain close to dry saturated steam."],
      "boiler-eff": ["> 80%", "Typical boiler efficiency reference; depends on fuel and boiler type."]
    };
    const item = ranges[tool.id];
    if (!item) return no;
    return { value: item[0], note: lang === "en" ? item[1] : translateSuggestion(item[1]) };
  }

  function translateSuggestion(text) {
    const map = {
      "Saturated steam distribution lines.": "饱和蒸汽输送主管常用参考。",
      "Common target for steam distribution sizing.": "蒸汽输送管径选择常用目标。",
      "Use the velocity result when checking pipe capacity.": "结合计算出的流速判断管道能力。",
      "Keep pressure loss aligned with system pressure margin.": "压损应与系统可用压差和末端压力要求匹配。",
      "Two-phase condensate return lines often require conservative velocity limits.": "两相冷凝水回收管通常宜采用更保守的流速限制。",
      "Check selected return pipe velocity and back pressure.": "需同时复核回收管流速和背压。",
      "Typical closed water piping reference.": "闭式水系统管道常用参考。",
      "Use with calculated pipe velocity when selecting DN.": "选择 DN 时结合计算出的管内流速判断。",
      "Common compressed-air header reference; branches may differ.": "压缩空气主管常用参考，支管可按项目调整。",
      "Common compressed-air header sizing reference.": "压缩空气主管选型常用参考。",
      "Typical target for compressed-air distribution pressure loss.": "压缩空气输送压损常用目标。",
      "Check allowable pressure loss against compressor and user pressure.": "需结合压缩机出口压力和用气点压力复核。",
      "Dry saturated steam service generally benefits from high dryness fraction.": "干饱和蒸汽工况通常需要较高干燥度。",
      "Separator outlet should usually remain close to dry saturated steam.": "汽水分离器出口通常应接近干饱和蒸汽。",
      "Typical boiler efficiency reference; depends on fuel and boiler type.": "锅炉效率需结合燃料和炉型判断。"
    };
    return map[text] || ui("standard");
  }

  function printCurrent() {
    calculate();
    document.body.classList.add("print-mode");
    setTimeout(() => window.print(), 50);
  }

  function renderValidation() {
    const cases = [
      ["流速 检查样本", "DIN 2448 / DN80 / 7 barG / 1000 kg/h", 12.4687, tools[0].calc({ pipeClass: "DIN 2448", nominalSize: "DN80", diameter: 82.5, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h" }).value, "m/s"],
      ["流速 检查样本", "DIN 2448 / DN80 / 1 barG / 1000 kg/h", 45.7424, tools[0].calc({ pipeClass: "DIN 2448", nominalSize: "DN80", diameter: 82.5, diameterUnit: "mm", pressure: 1, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h" }).value, "m/s"],
      ["流量 检查样本", "DIN 2448 / DN80 / 7 barG / 12.4687 m/s", 1000, tools[1].calc({ pipeClass: "DIN 2448", nominalSize: "DN80", diameter: 82.5, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", velocity: 12.4687, velocityUnit: "m/s" }).value, "kg/h"],
      ["流量 检查样本", "DIN 2448 / DN80 / 7 barG / 62.3435 m/s", 5000, tools[1].calc({ pipeClass: "DIN 2448", nominalSize: "DN80", diameter: 82.5, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", velocity: 62.3435, velocityUnit: "m/s" }).value, "kg/h"],
      ["流量 检查样本", "自定义 80 mm / 7 barG / 13.2602 m/s", 1000, tools[1].calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 80, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", velocity: 13.2602, velocityUnit: "m/s" }).value, "kg/h"],
      ["选管(压损) 检查样本", "7 barG / 1000 kg/h / 1 bar / 100 m", "DN50", getTool("steam-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", maxDp: 1, maxDpUnit: "bar", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(压损) 检查样本", "7 barG / 1000 kg/h / 0.3 bar / 100 m", "DN65", getTool("steam-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(压损) 检查样本", "7 barG / 5000 kg/h / 0.2 bar / 100 m", "DN125", getTool("steam-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 5000, flowUnit: "kg/h", maxDp: 0.2, maxDpUnit: "bar", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(压损) 检查样本", "7 barG / 1000 kg/h / 0.3 bar / 100 m + 1 截止阀 + 4 弯管", "DN65", getTool("steam-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m", globe: 1, gate: 0, check: 0, elbow: 4, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(压损) 检查样本", "1 barG / 1000 kg/h / 0.1 bar / 100 m", "DN100", getTool("steam-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 1, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", maxDp: 0.1, maxDpUnit: "bar", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(流速) 检查样本", "7 barG / 1000 kg/h / 30 m/s / 100 m", "DN50", getTool("steam-size-velocity").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", velocity: 30, velocityUnit: "m/s", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(流速) 检查样本", "7 barG / 5000 kg/h / 30 m/s / 100 m", "DN125", getTool("steam-size-velocity").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 5000, flowUnit: "kg/h", velocity: 30, velocityUnit: "m/s", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["选管(流速) 检查样本", "7 barG / 1000 kg/h / 20 m/s / 100 m + 1 截止阀 + 4 弯管", "DN65", getTool("steam-size-velocity").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", velocity: 20, velocityUnit: "m/s", length: 100, lengthUnit: "m", globe: 1, gate: 0, check: 0, elbow: 4, rough: 0.05, roughUnit: "mm" }).value, ""],
      ["压损 检查样本", "DN50 / 7 barG / 1000 kg/h / 100 m", 0.626902, getTool("steam-pressure-loss").calc({ pipeClass: "DIN 2448", nominalSize: "DN50", diameter: 54.5, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, "bar"],
      ["压损 检查样本", "DN125 / 7 barG / 5000 kg/h / 100 m", 0.156161, getTool("steam-pressure-loss").calc({ pipeClass: "DIN 2448", nominalSize: "DN125", diameter: 131.7, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", flow: 5000, flowUnit: "kg/h", length: 100, lengthUnit: "m", globe: 0, gate: 0, check: 0, elbow: 0, rough: 0.05, roughUnit: "mm" }).value, "bar"],
      ["压损 检查样本", "DN65 / 7 barG / 1000 kg/h / 100 m + 1 截止阀 + 4 弯管", 0.258036, getTool("steam-pressure-loss").calc({ pipeClass: "DIN 2448", nominalSize: "DN65", diameter: 70.3, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", flow: 1000, flowUnit: "kg/h", length: 100, lengthUnit: "m", globe: 1, gate: 0, check: 0, elbow: 4, rough: 0.05, roughUnit: "mm" }).value, "bar"],
      ["阀门流量 检查样本", "7 -> 5 barG / Kv 10", 812.812, getTool("steam-valve-flow").calc({ p1: 7, p1Unit: "barG", p2: 5, p2Unit: "barG", cv: 10, cvUnit: "Kv" }).value, "kg/h"],
      ["阀门流量 检查样本", "10 -> 5 barG / Kv 10", 1339.81, getTool("steam-valve-flow").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", cv: 10, cvUnit: "Kv" }).value, "kg/h"],
      ["孔板流量 检查样本", "7 -> 5 barG / 20 mm", 900.484, getTool("steam-orifice-flow").calc({ p1: 7, p1Unit: "barG", p2: 5, p2Unit: "barG", diameter: 20, diameterUnit: "mm" }).value, "kg/h"],
      ["孔板流量 检查样本", "7 -> 1 barG / 20 mm", 1151.02, getTool("steam-orifice-flow").calc({ p1: 7, p1Unit: "barG", p2: 1, p2Unit: "barG", diameter: 20, diameterUnit: "mm" }).value, "kg/h"],
      ["孔板流量 检查样本", "7 -> 5 barG / 40 mm", 3601.94, getTool("steam-orifice-flow").calc({ p1: 7, p1Unit: "barG", p2: 5, p2Unit: "barG", diameter: 40, diameterUnit: "mm" }).value, "kg/h"],
      ["阀门 Kv 检查样本", "7 -> 5 barG / 1000 kg/h", 12.303, getTool("valve-cv").calc({ p1: 7, p1Unit: "barG", p2: 5, p2Unit: "barG", flow: 1000, flowUnit: "kg/h" }).value, ""],
      ["启动管道冷凝水 检查样本", "DIN 2448 / DN80 / 岩棉 50 mm / 7 barG / 100 m / 30 min", 32.9537, getTool("cond-pipe-start").calc({ pipeClass: "DIN 2448", nominalSize: "DN80", insulation: "岩棉", pressure: 7, pressureUnit: "barG", thickness: 50, thicknessUnit: "mm", length: 100, lengthUnit: "m", minutes: 30, minutesUnit: "min" }).value, "kg"],
      ["启动管道冷凝水 检查样本", "DIN 2448 / DN50 / 岩棉 50 mm / 7 barG / 100 m / 30 min", 20.737, getTool("cond-pipe-start").calc({ pipeClass: "DIN 2448", nominalSize: "DN50", insulation: "岩棉", pressure: 7, pressureUnit: "barG", thickness: 50, thicknessUnit: "mm", length: 100, lengthUnit: "m", minutes: 30, minutesUnit: "min" }).value, "kg"],
      ["启动管道冷凝水 检查样本", "DIN 2448 / DN80 / 无保温 / 7 barG / 100 m / 30 min", 69.5408, getTool("cond-pipe-start").calc({ pipeClass: "DIN 2448", nominalSize: "DN80", insulation: "岩棉", pressure: 7, pressureUnit: "barG", thickness: 0, thicknessUnit: "mm", length: 100, lengthUnit: "m", minutes: 30, minutesUnit: "min" }).value, "kg"],
      ["连续加热液体 检查样本", "淡水 / 1 m3/h / 20 -> 80 degC / 7 barG", 122.811, getTool("cond-liquid-cont").calc({ fluid: "淡水", liquidFlow: 1, liquidFlowUnit: "m3/h", tin: 20, tinUnit: "degC", tout: 80, toutUnit: "degC", pressure: 7, pressureUnit: "barG" }).value, "kg/h"],
      ["连续加热液体 检查样本", "淡水 / 1 m3/h / 20 -> 80 degC / 1 barG", 114.222, getTool("cond-liquid-cont").calc({ fluid: "淡水", liquidFlow: 1, liquidFlowUnit: "m3/h", tin: 20, tinUnit: "degC", tout: 80, toutUnit: "degC", pressure: 1, pressureUnit: "barG" }).value, "kg/h"],
      ["连续加热液体 检查样本", "乙醇 / 1 m3/h / 20 -> 60 degC / 7 barG", 35.3699, getTool("cond-liquid-cont").calc({ fluid: "乙醇", liquidFlow: 1, liquidFlowUnit: "m3/h", tin: 20, tinUnit: "degC", tout: 60, toutUnit: "degC", pressure: 7, pressureUnit: "barG" }).value, "kg/h"],
      ["批次加热液体 检查样本", "淡水 / 1 m3 / 20 -> 80 degC / 7 barG / 60 min", 122.811, getTool("cond-liquid-batch").calc({ fluid: "淡水", volume: 1, volumeUnit: "m3", tin: 20, tinUnit: "degC", tout: 80, toutUnit: "degC", pressure: 7, pressureUnit: "barG", minutes: 60, minutesUnit: "min" }).value, "kg"],
      ["批次加热液体 检查样本", "淡水 / 1 m3 / 20 -> 80 degC / 1 barG / 60 min", 114.222, getTool("cond-liquid-batch").calc({ fluid: "淡水", volume: 1, volumeUnit: "m3", tin: 20, tinUnit: "degC", tout: 80, toutUnit: "degC", pressure: 1, pressureUnit: "barG", minutes: 60, minutesUnit: "min" }).value, "kg"],
      ["批次加热液体 检查样本", "乙醇 / 1 m3 / 20 -> 60 degC / 7 barG / 60 min", 35.3699, getTool("cond-liquid-batch").calc({ fluid: "乙醇", volume: 1, volumeUnit: "m3", tin: 20, tinUnit: "degC", tout: 60, toutUnit: "degC", pressure: 7, pressureUnit: "barG", minutes: 60, minutesUnit: "min" }).value, "kg"],
      ["加热空气 检查样本", "7 barG / 10 m3/min / 10 -> 60 degC", 18.3459, getTool("cond-air").calc({ pressure: 7, pressureUnit: "barG", airFlow: 10, airFlowUnit: "m3/min", tin: 10, tinUnit: "degC", tout: 60, toutUnit: "degC" }).value, "kg/h"],
      ["加热空气 检查样本", "7 barG / 10 m3/min / 10 -> 80 degC", 25.6842, getTool("cond-air").calc({ pressure: 7, pressureUnit: "barG", airFlow: 10, airFlowUnit: "m3/min", tin: 10, tinUnit: "degC", tout: 80, toutUnit: "degC" }).value, "kg/h"],
      ["加热空气 检查样本", "1 barG / 10 m3/min / 10 -> 60 degC", 17.0629, getTool("cond-air").calc({ pressure: 1, pressureUnit: "barG", airFlow: 10, airFlowUnit: "m3/min", tin: 10, tinUnit: "degC", tout: 60, toutUnit: "degC" }).value, "kg/h"],
      ["减压干燥度 检查样本", "10 -> 5 barG / 95%", 96.3801, getTool("dryness-pr").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", x1: 95 }).value, "%"],
      ["减压干燥度 检查样本", "10 -> 1 barG / 95%", 98.8279, getTool("dryness-pr").calc({ p1: 10, p1Unit: "barG", p2: 1, p2Unit: "barG", x1: 95 }).value, "%"],
      ["减压干燥度 检查样本", "7 -> 1 barG / 90%", 93.5084, getTool("dryness-pr").calc({ p1: 7, p1Unit: "barG", p2: 1, p2Unit: "barG", x1: 90 }).value, "%"],
      ["减压干燥度 检查样本", "20 -> 5 barG / 95%", 97.5628, getTool("dryness-pr").calc({ p1: 20, p1Unit: "barG", p2: 5, p2Unit: "barG", x1: 95 }).value, "%"],
      ["减压干燥度 检查样本", "10 -> 5 barG / 80%", 81.9993, getTool("dryness-pr").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", x1: 80 }).value, "%"],
      ["减压过热度 检查样本", "20 -> 1 barG / 100%", 42.651, getTool("dryness-pr").calc({ p1: 20, p1Unit: "barG", p2: 1, p2Unit: "barG", x1: 100 }).rows[1][1], "degC"],
      ["减压+分离二次干燥度 检查样本", "10 -> 5 barG / 1000 kg/h / 98% / 50 kg/h", 100.001, getTool("dryness-separator").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 98, condensate: 50, condensateUnit: "kg/h" }).value, "%"],
      ["减压+分离一次干燥度 检查样本", "10 -> 5 barG / 1000 kg/h / 98% / 50 kg/h", 94.898, getTool("dryness-separator").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 98, condensate: 50, condensateUnit: "kg/h" }).rows[1][1], "%"],
      ["减压+分离过热度 检查样本", "10 -> 5 barG / 1000 kg/h / 98% / 50 kg/h", 2.15011, getTool("dryness-separator").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 98, condensate: 50, condensateUnit: "kg/h" }).rows[3][1], "degC"],
      ["减压+分离过热度 检查样本", "10 -> 1 barG / 1000 kg/h / 98% / 50 kg/h", 7.90503, getTool("dryness-separator").calc({ p1: 10, p1Unit: "barG", p2: 1, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 98, condensate: 50, condensateUnit: "kg/h" }).rows[3][1], "degC"],
      ["减压+分离一次干燥度 检查样本", "7 -> 1 barG / 1000 kg/h / 98% / 100 kg/h", 89.7959, getTool("dryness-separator").calc({ p1: 7, p1Unit: "barG", p2: 1, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 98, condensate: 100, condensateUnit: "kg/h" }).rows[1][1], "%"],
      ["减压+分离过热度 检查样本", "7 -> 1 barG / 1000 kg/h / 98% / 100 kg/h", 6.27667, getTool("dryness-separator").calc({ p1: 7, p1Unit: "barG", p2: 1, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 98, condensate: 100, condensateUnit: "kg/h" }).rows[3][1], "degC"],
      ["减压+分离二次干燥度 检查样本", "10 -> 5 barG / 1000 kg/h / 50% / 50 kg/h", 96.1278, getTool("dryness-separator").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 50, condensate: 50, condensateUnit: "kg/h" }).value, "%"],
      ["减压+分离二次干燥度 检查样本", "10 -> 5 barG / 1000 kg/h / 70% / 50 kg/h", 99.0112, getTool("dryness-separator").calc({ p1: 10, p1Unit: "barG", p2: 5, p2Unit: "barG", flow: 1000, flowUnit: "kg/h", eff: 70, condensate: 50, condensateUnit: "kg/h" }).value, "%"],
      ["蒸汽含空气温降 检查样本", "7 barG / 空气 10%", 4.32271, getTool("air-mixture-temp").calc({ pressure: 7, pressureUnit: "barG", airPct: 10 }).value, "degC"],
      ["蒸汽含空气温降 检查样本", "7 barG / 空气 20%", 9.04519, getTool("air-mixture-temp").calc({ pressure: 7, pressureUnit: "barG", airPct: 20 }).value, "degC"],
      ["蒸汽含空气温降 检查样本", "1 barG / 空气 10%", 3.30312, getTool("air-mixture-temp").calc({ pressure: 1, pressureUnit: "barG", airPct: 10 }).value, "degC"],
      ["蒸汽含空气温降 检查样本", "10 barG / 空气 10%", 4.6215, getTool("air-mixture-temp").calc({ pressure: 10, pressureUnit: "barG", airPct: 10 }).value, "degC"],
      ["蒸汽含空气百分比 检查样本", "7 barG / 混合温度 160 degC", 22.8604, getTool("air-mixture-pct").calc({ pressure: 7, pressureUnit: "barG", temperature: 160, temperatureUnit: "degC" }).value, "%"],
      ["蒸汽含空气百分比 检查样本", "7 barG / 混合温度 150 degC", 40.5857, getTool("air-mixture-pct").calc({ pressure: 7, pressureUnit: "barG", temperature: 150, temperatureUnit: "degC" }).value, "%"],
      ["蒸汽含空气百分比 检查样本", "1 barG / 混合温度 110 degC", 28.7838, getTool("air-mixture-pct").calc({ pressure: 1, pressureUnit: "barG", temperature: 110, temperatureUnit: "degC" }).value, "%"],
      ["蒸汽含空气百分比 检查样本", "10 barG / 混合温度 170 degC", 28.0818, getTool("air-mixture-pct").calc({ pressure: 10, pressureUnit: "barG", temperature: 170, temperatureUnit: "degC" }).value, "%"],
      ["单位能源成本 检查样本", "35800 kJ/kg / 3200 RMB/ton / 82%", 0.109007, getTool("energy-cost").calc({ cv: 35800, cvUnit: "kJ/kg", price: 3200, priceUnit: "RMB/ton", eff: 82 }).value, "RMB/MJ"],
      ["单位能源成本 检查样本", "42000 kJ/kg / 4000 RMB/ton / 90%", 0.10582, getTool("energy-cost").calc({ cv: 42000, cvUnit: "kJ/kg", price: 4000, priceUnit: "RMB/ton", eff: 90 }).value, "RMB/MJ"],
      ["单位蒸汽成本 检查样本", "7 barG / 85 degC / 0.10905 RMB/MJ", 263.09, getTool("steam-cost").calc({ pressure: 7, pressureUnit: "barG", feedwater: 85, feedwaterUnit: "degC", energyCost: 0.10905, energyCostUnit: "RMB/MJ" }).value, "RMB/ton"],
      ["单位蒸汽成本 检查样本", "1 barG / 85 degC / 0.10905 RMB/MJ", 256.348, getTool("steam-cost").calc({ pressure: 1, pressureUnit: "barG", feedwater: 85, feedwaterUnit: "degC", energyCost: 0.10905, energyCostUnit: "RMB/MJ" }).value, "RMB/ton"],
      ["锅炉效率 检查样本", "7 barG / 85 degC / 1000 kg/h / 35800 kJ/kg / 80 kg/h", 82.8079, getTool("boiler-eff").calc({ pressure: 7, pressureUnit: "barG", feedwater: 85, feedwaterUnit: "degC", feedFlow: 1000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", fuel: 80, fuelUnit: "kg/h", maxFlow: 2000, maxFlowUnit: "kg/h" }).value, "%"],
      ["锅炉效率 检查样本", "1 barG / 85 degC / 1000 kg/h / 35800 kJ/kg / 80 kg/h", 80.5417, getTool("boiler-eff").calc({ pressure: 1, pressureUnit: "barG", feedwater: 85, feedwaterUnit: "degC", feedFlow: 1000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", fuel: 80, fuelUnit: "kg/h", maxFlow: 2000, maxFlowUnit: "kg/h" }).value, "%"],
      ["锅炉负载系数 检查样本", "5000 kg/h / 8000 kg/h", 62.5, getTool("boiler-eff").calc({ pressure: 7, pressureUnit: "barG", feedwater: 85, feedwaterUnit: "degC", feedFlow: 5000, feedFlowUnit: "kg/h", cv: 42000, cvUnit: "kJ/kg", fuel: 400, fuelUnit: "kg/h", maxFlow: 8000, maxFlowUnit: "kg/h" }).rows[0][1], "%"],
      ["闪蒸汽流量 检查样本", "7 -> 1 barG / 1000 kg/h", 98.0233, getTool("flash-steam").calc({ p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG" }).value, "kg/h"],
      ["闪蒸汽百分比 检查样本", "7 -> 1 barG / 1000 kg/h", 9.80233, getTool("flash-steam").calc({ p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG" }).rows[0][1], "%"],
      ["闪蒸汽流量 检查样本", "10 -> 1 barG / 1000 kg/h", 125.337, getTool("flash-steam").calc({ p1: 10, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG" }).value, "kg/h"],
      ["闪蒸汽流量 检查样本", "7 -> 0 barG / 1000 kg/h", 133.978, getTool("flash-steam").calc({ p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 0, p2Unit: "barG" }).value, "kg/h"],
      ["回收管选型(压损) 检查样本", "7 -> 1 barG / 1000 kg/h / 0.3 bar / 100 m", "DN50", getTool("recovery-size-pressure-loss").calc({ pipeClass: "DIN 2448", p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m" }).value, ""],
      ["回收管流速(压损) 检查样本", "7 -> 1 barG / 1000 kg/h / DN50", 10.3885, getTool("recovery-size-pressure-loss").calc({ pipeClass: "DIN 2448", p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m" }).rows[1][1], "m/s"],
      ["回收管压损(压损) 检查样本", "7 -> 1 barG / 1000 kg/h / DN50", 0.292847, getTool("recovery-size-pressure-loss").calc({ pipeClass: "DIN 2448", p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m" }).rows[2][1], "bar"],
      ["回收管选型(压损) 检查样本", "7 -> 1 barG / 5000 kg/h / 0.3 bar / 100 m", "DN100", getTool("recovery-size-pressure-loss").calc({ pipeClass: "DIN 2448", p1: 7, p1Unit: "barG", cond: 5000, condUnit: "kg/h", p2: 1, p2Unit: "barG", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m" }).value, ""],
      ["回收管选型(流速) 检查样本", "7 -> 1 barG / 1000 kg/h / 15 m/s / 100 m", "DN50", getTool("recovery-size-velocity").calc({ pipeClass: "DIN 2448", p1: 7, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG", length: 100, lengthUnit: "m", velocity: 15, velocityUnit: "m/s" }).value, ""],
      ["回收管选型(流速) 检查样本", "3 -> 1 barG / 1000 kg/h / 10 m/s / 100 m", "DN40", getTool("recovery-size-velocity").calc({ pipeClass: "DIN 2448", p1: 3, p1Unit: "barG", cond: 1000, condUnit: "kg/h", p2: 1, p2Unit: "barG", length: 100, lengthUnit: "m", velocity: 10, velocityUnit: "m/s" }).value, ""],
      ["开放式回收燃料节约值 检查样本", "7 barG / 1000 kg/h / 85 degC / 8000 h", 255.633, getTool("recovery-open-econ").calc({ steamPressure: 7, steamPressureUnit: "barG", condPressure: 7, condPressureUnit: "barG", cond: 1000, condUnit: "kg/h", feedTemp: 85, feedTempUnit: "degC", feedFlow: 2000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", eff: 82, energyCost: 0.10905, energyCostUnit: "RMB/MJ", hours: 8000, hoursUnit: "h", maxFeedTemp: 120, maxFeedTempUnit: "degC" }).value, "x1000RMB/yr"],
      ["开放式回收热量 检查样本", "7 barG / 1000 kg/h / 85 degC / 8000 h", 81395.3, getTool("recovery-open-econ").calc({ steamPressure: 7, steamPressureUnit: "barG", condPressure: 7, condPressureUnit: "barG", cond: 1000, condUnit: "kg/h", feedTemp: 85, feedTempUnit: "degC", feedFlow: 2000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", eff: 82, energyCost: 0.10905, energyCostUnit: "RMB/MJ", hours: 8000, hoursUnit: "h", maxFeedTemp: 120, maxFeedTempUnit: "degC" }).rows[0][1], "W"],
      ["封闭式回收燃料节约值 检查样本", "7 -> 1 barG / 1000 kg/h / 85 degC / 8000 h", 312.173, getTool("recovery-closed-econ").calc({ steamPressure: 7, steamPressureUnit: "barG", condPressure: 7, condPressureUnit: "barG", cond: 1000, condUnit: "kg/h", recoveryPressure: 1, recoveryPressureUnit: "barG", feedTemp: 85, feedTempUnit: "degC", feedFlow: 2000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", eff: 82, energyCost: 0.10905, energyCostUnit: "RMB/MJ", hours: 8000, hoursUnit: "h" }).value, "x1000RMB/yr"],
      ["封闭式回收热量 检查样本", "7 -> 1 barG / 1000 kg/h / 85 degC / 8000 h", 99397.8, getTool("recovery-closed-econ").calc({ steamPressure: 7, steamPressureUnit: "barG", condPressure: 7, condPressureUnit: "barG", cond: 1000, condUnit: "kg/h", recoveryPressure: 1, recoveryPressureUnit: "barG", feedTemp: 85, feedTempUnit: "degC", feedFlow: 2000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", eff: 82, energyCost: 0.10905, energyCostUnit: "RMB/MJ", hours: 8000, hoursUnit: "h" }).rows[0][1], "W"],
      ["闪蒸汽回收燃料节约值 检查样本", "7 -> 1 barG / 1000 kg/h / 原水 20 degC / 8000 h", 224.295, getTool("recovery-flash-econ").calc({ steamPressure: 7, steamPressureUnit: "barG", condPressure: 7, condPressureUnit: "barG", cond: 1000, condUnit: "kg/h", feedTemp: 85, feedTempUnit: "degC", feedFlow: 2000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", eff: 82, energyCost: 0.10905, energyCostUnit: "RMB/MJ", rawTemp: 20, rawTempUnit: "degC", hours: 8000, hoursUnit: "h", flashPressure: 1, flashPressureUnit: "barG" }).value, "x1000RMB/yr"],
      ["闪蒸汽回收流量 检查样本", "7 -> 1 barG / 1000 kg/h", 98.0233, getTool("recovery-flash-econ").calc({ steamPressure: 7, steamPressureUnit: "barG", condPressure: 7, condPressureUnit: "barG", cond: 1000, condUnit: "kg/h", feedTemp: 85, feedTempUnit: "degC", feedFlow: 2000, feedFlowUnit: "kg/h", cv: 35800, cvUnit: "kJ/kg", eff: 82, energyCost: 0.10905, energyCostUnit: "RMB/MJ", rawTemp: 20, rawTempUnit: "degC", hours: 8000, hoursUnit: "h", flashPressure: 1, flashPressureUnit: "barG" }).rows[3][1], "kg/h"],
      ["饱和蒸汽表(压力) 检查样本", "7 barG / 饱和温度", 170.482, getTool("steam-table-pressure").calc({ pressure: 7, pressureUnit: "barG" }).value, "degC"],
      ["饱和蒸汽表(压力) 检查样本", "7 barG / 蒸汽潜热", 2047.05, getTool("steam-table-pressure").calc({ pressure: 7, pressureUnit: "barG" }).rows[0][1], "kJ/kg"],
      ["饱和蒸汽表(压力) 检查样本", "10 barG / 饱和蒸汽比容", 0.177232, getTool("steam-table-pressure").calc({ pressure: 10, pressureUnit: "barG" }).rows[3][1], "m3/kg"],
      ["饱和蒸汽表(温度) 检查样本", "170 degC / 蒸汽压力", 6.90728, getTool("steam-table-temperature").calc({ temperature: 170, temperatureUnit: "degC" }).value, "barG"],
      ["饱和蒸汽表(温度) 检查样本", "184 degC / 饱和蒸汽热焓", 2780.61, getTool("steam-table-temperature").calc({ temperature: 184, temperatureUnit: "degC" }).rows[1][1], "kJ/kg"],
      ["饱和蒸汽表(温度) 检查样本", "120 degC / 饱和蒸汽比容", 0.891304, getTool("steam-table-temperature").calc({ temperature: 120, temperatureUnit: "degC" }).rows[3][1], "m3/kg"],
      ["过热蒸汽表 检查样本", "7 barG / 200 degC / 热焓", 2839.7, getTool("superheated-steam-table").calc({ pressure: 7, pressureUnit: "barG", temperature: 200, temperatureUnit: "degC" }).value, "kJ/kg"],
      ["过热蒸汽表 检查样本", "7 barG / 250 degC / 比容", 0.2927, getTool("superheated-steam-table").calc({ pressure: 7, pressureUnit: "barG", temperature: 250, temperatureUnit: "degC" }).rows[0][1], "m3/kg"],
      ["过热蒸汽表 检查样本", "10 barG / 250 degC / 比热", 2.24173, getTool("superheated-steam-table").calc({ pressure: 10, pressureUnit: "barG", temperature: 250, temperatureUnit: "degC" }).rows[1][1], "kJ/kgK"],
      ["过热蒸汽表 检查样本", "1 barG / 150 degC / 粘度", 0.0141321, getTool("superheated-steam-table").calc({ pressure: 1, pressureUnit: "barG", temperature: 150, temperatureUnit: "degC" }).rows[2][1], "mPa s"],
      ["过热蒸汽表 检查样本", "20 barG / 300 degC / 热焓", 3021.34, getTool("superheated-steam-table").calc({ pressure: 20, pressureUnit: "barG", temperature: 300, temperatureUnit: "degC" }).value, "kJ/kg"],
      ["水流速 检查样本", "DIN 2448 / DN6 / 100 m3/h", 721.791, getTool("water-velocity").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", liquidFlow: 100, liquidFlowUnit: "m3/h" }).value, "m/s"],
      ["水流速 检查样本", "DIN 2448 / DN6 / 500 m3/h", 3608.96, getTool("water-velocity").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", liquidFlow: 500, liquidFlowUnit: "m3/h" }).value, "m/s"],
      ["水流量 检查样本", "DIN 2448 / DN6 / 4.67695 m/s", 0.647964, getTool("water-flow").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", velocity: 4.67695, velocityUnit: "m/s" }).value, "m3/h"],
      ["水流量 检查样本", "DIN 2448 / DN6 / 23.3848 m/s", 3.23983, getTool("water-flow").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", velocity: 23.3848, velocityUnit: "m/s" }).value, "m3/h"],
      ["水保温层厚度 检查样本", "RH 80% / 5 -> 30 degC", 20, getTool("water-insulation").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", insulation: "岩棉", rh: 80, tin: 5, tinUnit: "degC", tamb: 30, tambUnit: "degC" }).value, "mm"],
      ["水保温层厚度 检查样本", "RH 60% / 5 -> 30 degC", 10, getTool("water-insulation").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", insulation: "岩棉", rh: 60, tin: 5, tinUnit: "degC", tamb: 30, tambUnit: "degC" }).value, "mm"],
      ["水保温露点 检查样本", "RH 80% / 30 degC", 26.1684, getTool("water-insulation").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", insulation: "岩棉", rh: 80, tin: 5, tinUnit: "degC", tamb: 30, tambUnit: "degC" }).rows[0][1], "degC"],
      ["空气流速 检查样本", "DIN 2448 / DN6 / 7 barG / 20 degC / 1 m3/min", 433.075, getTool("air-velocity").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", airFlow: 1, airFlowUnit: "m3/min" }).value, "m/s"],
      ["空气流量 检查样本", "DIN 2448 / DN6 / 7 barG / 20 degC / 20 m/s", 0.0461814, getTool("air-flow").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", velocity: 20, velocityUnit: "m/s" }).value, "m3/min"],
      ["空气名义流量 检查样本", "DIN 2448 / DN6 / 7 barG / 20 degC / 20 m/s", 0.340307, getTool("air-flow").calc({ pipeClass: "DIN 2448", nominalSize: "DN6", diameter: 0, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", velocity: 20, velocityUnit: "m/s" }).rows[0][1], "Nm3/min"],
      ["空气选管(压损) 检查样本", "7 barG / 20 degC / 1 m3/min / 0.3 bar / 100 m", "DN50", getTool("air-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", airFlow: 1, airFlowUnit: "m3/min", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m" }).value, ""],
      ["空气选管(压损) 检查样本", "7 barG / 20 degC / 5 m3/min / 0.3 bar / 100 m", "DN80", getTool("air-size-pressure-loss").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", airFlow: 5, airFlowUnit: "m3/min", maxDp: 0.3, maxDpUnit: "bar", length: 100, lengthUnit: "m" }).value, ""],
      ["空气选管(流速) 检查样本", "7 barG / 20 degC / 1 m3/min / 20 m/s / 100 m", "DN32", getTool("air-size-velocity").calc({ pipeClass: "DIN 2448", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", airFlow: 1, airFlowUnit: "m3/min", length: 100, lengthUnit: "m", velocity: 20, velocityUnit: "m/s" }).value, ""],
      ["空气压损 检查样本", "DN50 / 7 barG / 20 degC / 1 m3/min / 100 m", 0.0928852, getTool("air-pressure-loss").calc({ pipeClass: "DIN 2448", nominalSize: "DN50", diameter: 0, diameterUnit: "mm", pressure: 7, pressureUnit: "barG", temperature: 20, temperatureUnit: "degC", airFlow: 1, airFlowUnit: "m3/min", length: 100, lengthUnit: "m" }).value, "bar"]
    ];
    els.validation.innerHTML = cases.map(c => {
      const numeric = Number.isFinite(Number(c[2])) && Number.isFinite(Number(c[3]));
      const pass = numeric ? Math.abs(Number(c[3]) - Number(c[2])) < Math.max(1.5, Math.abs(Number(c[2])) * 0.01) : c[2] === c[3];
      const diff = numeric ? fmt(Number(c[3]) - Number(c[2]), 4) : (pass ? "一致" : "不一致");
      return `<article class="${pass ? "pass" : "warn"}"><strong>${c[0]}</strong><span>${c[1]}</span><dl><div><dt>参考</dt><dd>${fmt(c[2], 4)} ${c[4]}</dd></div><div><dt>本地</dt><dd>${fmt(c[3], 4)} ${c[4]}</dd></div><div><dt>偏差</dt><dd>${diff} ${numeric ? c[4] : ""}</dd></div></dl></article>`;
    }).join("");
  }

  function getTool(id) {
    return tools.find(t => t.id === id);
  }

  function pipeFields() {
    return [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.select("nominalSize", "管径", "DN80", NOMINAL_SIZES), f.number("diameter", "管道内径", 82.5, "mm", diameterUnits(), "默认按管材等级和 DN 自动取值；手动输入时按手动值计算。")];
  }
  function waterPipeFields() {
    return [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.select("nominalSize", "管径", "DN6", NOMINAL_SIZES), f.number("diameter", "管道内径", 0, "mm", diameterUnits(), "输入 0 时按管材等级和 DN 自动取值。")];
  }
  function airPipeFields() {
    return [f.select("pipeClass", "管材等级", "DIN 2448", PIPE_CLASSES), f.select("nominalSize", "管径", "DN6", NOMINAL_SIZES), f.number("diameter", "管道内径", 0, "mm", diameterUnits(), "输入 0 时按管材等级和 DN 自动取值。")];
  }

  function pipeDiameter(v) {
    const manual = Number(v.diameter);
    if (Number.isFinite(manual) && manual > 0) return diameterM(manual, v.diameterUnit || "mm");
    const list = PIPE_D[v.pipeClass] || PIPE_D["DIN 2448"];
    const d = list[NOMINAL_SIZES.indexOf(v.nominalSize)];
    if (!d) throw new Error("该管材等级没有对应管径。");
    return d / 1000;
  }

  function result(label, value, unit, rows) { return { label, value, unit, rows }; }
  function diameterUnits() { return ["mm", "cm", "m", "in", "ft", "yd"]; }
  function pressureUnits() { return ["kPa abs", "MPa abs", "psi abs", "bar abs", "kg/cm2 abs", "mmHg abs", "kPaG", "MPaG", "psig", "barG", "kg/cm2G", "mmHgG"]; }
  function flowUnits() { return ["kg/h", "t(metric)/h", "lb/h"]; }
  function velocityUnits() { return ["m/s", "km/h", "ft/s", "mile/h"]; }
  function pressureDropUnits() { return ["kPa", "MPa", "psi", "bar", "kg/cm2", "mmHg"]; }
  function valveCoeffUnits() { return ["Kv", "Cv(US)", "Cv(UK)"]; }
  function fuelHeatUnits() { return ["kJ/kg", "MJ/kg", "kcal/kg", "BTU/lb"]; }
  function fuelPriceUnits() { return ["RMB/ton", "RMB/1000lb"]; }
  function energyCostUnits() { return ["RMB/MJ", "RMB/Mcal", "RMB/1000BTU"]; }
  function lengthUnits() { return ["m", "ft", "yd"]; }
  function timeUnits() { return ["sec", "min", "h"]; }
  function insulationTypes() { return ["岩棉", "玻璃棉", "硅酸钙", "珠光体"]; }
  function liquidTypes() { return ["淡水", "海水", "煤油", "乙醇", "甘油"]; }
  function liquidVolumeFlowUnits() { return ["m3/h", "l/h", "gal/h", "GPM"]; }
  function liquidVolumeUnits() { return ["m3", "mm3", "cm3(=mL)", "dm3(=L)", "gal (UK)", "gal (US)", "in3", "ft3", "yd3", "barrel"]; }
  function airVolumeFlowUnits() { return ["m3/min", "m3/h", "l/min", "CFM"]; }
  function tempUnits() { return ["degC", "degF", "K"]; }
  function defaultUnit(unit) { return unit === "barG" && els.unitGroup.value === "si" ? "kPaG" : unit; }
  function normalizeUnits(units, unit) { return units && units.length ? units : [unit || ""]; }

  function diameterM(v, u) {
    return Number(v) * ({ mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048, yd: 0.9144 }[u] || 1);
  }
  function lengthM(v, u) { return Number(v) * ({ mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048, yd: 0.9144 }[u] || 1); }
  function timeMinutes(v, u) {
    if (u === "sec") return Number(v) / 60;
    if (u === "h") return Number(v) * 60;
    return Number(v);
  }
  function liquidVolumeFlowM3H(v, u) {
    if (u === "l/h") return Number(v) / 1000;
    if (u === "gal/h") return Number(v) * 0.003785411784;
    if (u === "GPM") return Number(v) * 0.003785411784 * 60;
    return Number(v);
  }
  function liquidVolumeM3(v, u) {
    const x = Number(v);
    if (u === "mm3") return x * 1e-9;
    if (u === "cm3(=mL)") return x * 1e-6;
    if (u === "dm3(=L)") return x * 0.001;
    if (u === "gal (UK)") return x * 0.00454609;
    if (u === "gal (US)") return x * 0.003785411784;
    if (u === "in3") return x * 0.000016387064;
    if (u === "ft3") return x * 0.028316846592;
    if (u === "yd3") return x * 0.764554857984;
    if (u === "barrel") return x * 0.158987294928;
    return x;
  }
  function airVolumeFlowM3H(v, u) {
    const x = Number(v);
    if (u === "m3/min") return x * 60;
    if (u === "l/min") return x * 0.001 * 60;
    if (u === "CFM") return x * 0.028316846592 * 60;
    return x;
  }
  function airActualToNormalM3Min(actualM3S, v) {
    const p = pressureAbs(v.pressure, v.pressureUnit);
    const t = temperatureC(v.temperature, v.temperatureUnit);
    return actualM3S * 60 * p / ATM_BAR * 273.15 / (t + 273.15);
  }
  function airPipeProps(v, diameterMValue) {
    const d = diameterMValue || pipeDiameter(v);
    const q = airVolumeFlowM3H(v.airFlow, v.airFlowUnit) / 3600;
    const velocity = q / (Math.PI * d * d / 4);
    const p = pressureAbs(v.pressure, v.pressureUnit);
    const t = temperatureC(v.temperature, v.temperatureUnit);
    const density = p * 100000 / (287.05 * (t + 273.15));
    const length = lengthM(v.length, v.lengthUnit || "m");
    const dp = pressureDropBar(d, length, velocity, density, 0.00005) * 1.015;
    return { d, velocity, dp, length };
  }
  function selectAirPipe(v, predicate) {
    const list = PIPE_D[v.pipeClass] || PIPE_D["DIN 2448"];
    for (let i = 0; i < list.length; i++) {
      const diameterMm = list[i];
      if (!diameterMm) continue;
      const props = airPipeProps(v, diameterMm / 1000);
      const candidate = { size: NOMINAL_SIZES[i], diameterMm, velocity: props.velocity, dp: props.dp };
      if (predicate(candidate)) return candidate;
    }
    throw new Error("超过当前管径表范围。");
  }
  function airDensityAtC(t) {
    return 101325 / (287.05 * (Number(t) + 273.15));
  }
  function dewPointC(t, rh) {
    const a = 17.625, b = 243.04;
    const gamma = Math.log(Math.max(Math.min(rh, 100), 1) / 100) + a * Number(t) / (b + Number(t));
    return b * gamma / (a - gamma);
  }
  function temperatureC(v, u) {
    if (u === "degF") return (Number(v) - 32) * 5 / 9;
    if (u === "K") return Number(v) - 273.15;
    return Number(v);
  }
  function liquidProps(fluid) {
    return {
      "淡水": { rho: 1000, cp: 4.194 },
      "海水": { rho: 1025, cp: 3.99 },
      "煤油": { rho: 800, cp: 2.05 },
      "乙醇": { rho: 789, cp: 2.294 },
      "甘油": { rho: 1260, cp: 2.43 }
    }[fluid] || { rho: 1000, cp: 4.194 };
  }
  function massFlow(v, u) {
    if (u === "t(metric)/h") return Number(v) * 1000;
    if (u === "lb/h") return Number(v) / 2.2046226218;
    return Number(v);
  }
  function fuelHeatKjKg(v, u) {
    const x = Number(v);
    if (u === "MJ/kg") return x * 1000;
    if (u === "kcal/kg") return x * 4.1868;
    if (u === "BTU/lb") return x * 2.326;
    return x;
  }
  function fuelPriceRmbTon(v, u) {
    const x = Number(v);
    if (u === "RMB/1000lb") return x / 0.45359237;
    return x;
  }
  function energyCostRmbMj(v, u) {
    const x = Number(v);
    if (u === "RMB/Mcal") return x / 4.1868;
    if (u === "RMB/1000BTU") return x / 1.05506;
    return x;
  }
  function velocityMS(v, u) {
    if (u === "km/h") return Number(v) / 3.6;
    if (u === "ft/s") return Number(v) * 0.3048;
    if (u === "mile/h") return Number(v) / 2.2369362921;
    return Number(v);
  }
  function valveCoeffKv(v, u) {
    const x = Number(v);
    if (u === "Cv(US)") return x * 0.865;
    if (u === "Cv(UK)") return x * 0.9639;
    return x;
  }
  function steamValveBasis(p1, p2) {
    if (p1 <= p2) throw new Error("一次压力必须大于二次压力。");
    const xT = 0.72;
    const x = Math.max((p1 - p2) / p1, 0);
    const xLimited = Math.min(x, xT);
    const y = 1 - xLimited / (3 * xT);
    const rho = 1 / steamAtPressure(p1).vg;
    return { factor: 0.10069 * y * Math.sqrt(xLimited * p1 * 100000 * rho), x, y, rho };
  }
  function steamOrificeBasis(p1, p2, diameter) {
    if (p1 <= p2) throw new Error("一次压力必须大于二次压力。");
    const xT = 0.72;
    const x = Math.max((p1 - p2) / p1, 0);
    const xLimited = Math.min(x, xT);
    const y = 1 - xLimited / (3 * xT);
    const rho = 1 / steamAtPressure(p1).vg;
    const area = Math.PI * diameter * diameter / 4;
    const cd = 0.98605;
    const flow = cd * area * y * Math.sqrt(xLimited * p1 * 100000 * rho) * 3600;
    return { flow, area, x, y, rho, cd };
  }
  function pressureDropBarValue(v, u) {
    const x = Number(v);
    if (u === "kPa") return x / 100;
    if (u === "MPa") return x * 10;
    if (u === "psi") return x * 0.0689475729;
    if (u === "kg/cm2") return x * 0.980665;
    if (u === "mmHg") return x * 0.00133322368;
    return x;
  }
  function pressureAbs(v, u) {
    const x = Number(v);
    if (u === "kPa abs") return x / 100;
    if (u === "MPa abs") return x * 10;
    if (u === "psi abs") return x * 0.0689475729;
    if (u === "bar abs") return x;
    if (u === "kg/cm2 abs") return x * 0.980665;
    if (u === "mmHg abs") return x * 0.00133322368;
    if (u === "kPaG") return x / 100 + ATM_BAR;
    if (u === "MPaG") return x * 10 + ATM_BAR;
    if (u === "psig") return x * 0.0689475729 + ATM_BAR;
    if (u === "kg/cm2G") return x * 0.980665 + ATM_BAR;
    if (u === "mmHgG") return x * 0.00133322368 + ATM_BAR;
    return x + ATM_BAR;
  }
  function steamAtPressure(p) {
    const c = Math.min(Math.max(p, SAT[0][0]), SAT[SAT.length - 1][0]);
    for (let i = 0; i < SAT.length - 1; i++) {
      const a = SAT[i], b = SAT[i + 1];
      if (c >= a[0] && c <= b[0]) {
        const r = (Math.log(c) - Math.log(a[0])) / (Math.log(b[0]) - Math.log(a[0]));
        const t = a[1] + (b[1] - a[1]) * r;
        const vg = Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * r);
        const hf = a[3] + (b[3] - a[3]) * r;
        const hg = a[4] + (b[4] - a[4]) * r;
        return { p: c, t, vg, hf, hg, hfg: hg - hf };
      }
    }
    const l = SAT[SAT.length - 1];
    return { p: l[0], t: l[1], vg: l[2], hf: l[3], hg: l[4], hfg: l[4] - l[3] };
  }
  function pressureAtTemp(t) {
    const c = Number(t);
    for (let i = 0; i < SAT.length - 1; i++) {
      const a = SAT[i], b = SAT[i + 1];
      if (c >= a[1] && c <= b[1]) {
        const r = (c - a[1]) / (b[1] - a[1]);
        return Math.exp(Math.log(a[0]) + (Math.log(b[0]) - Math.log(a[0])) * r);
      }
    }
    return c < SAT[0][1] ? SAT[0][0] : SAT[SAT.length - 1][0];
  }
  function nearestDn(mm) {
    const d = PIPE_D["DIN 2448"];
    const i = d.findIndex(x => x && x >= mm);
    return i >= 0 ? NOMINAL_SIZES[i] : "> DN500";
  }
  function selectPipeByVelocity(pipeClass, requiredMm) {
    const list = PIPE_D[pipeClass] || PIPE_D["DIN 2448"];
    const index = list.findIndex(d => d && d >= requiredMm);
    if (index < 0) throw new Error("超过当前管径表范围。");
    return { size: NOMINAL_SIZES[index], diameterMm: list[index] };
  }
  function selectPipeByPressureLoss(v, steamProps, maxDpBar) {
    const list = PIPE_D[v.pipeClass] || PIPE_D["DIN 2448"];
    const ms = massFlow(v.flow, v.flowUnit);
    const baseLength = lengthM(v.length, v.lengthUnit);
    const roughness = diameterM(v.rough, v.roughUnit || "mm");
    for (let i = 0; i < list.length; i++) {
      const diameterMm = list[i];
      if (!diameterMm) continue;
      const d = diameterMm / 1000;
      const velocity = 4 * ms * steamProps.vg / (3600 * Math.PI * d * d);
      const le = equivalentLength(baseLength, d, v);
      const dp = pressureDropBar(d, le, velocity, 1 / steamProps.vg, roughness);
      if (dp <= maxDpBar) {
        return { size: NOMINAL_SIZES[i], diameterMm, velocity, dp, equivalentLength: le };
      }
    }
    throw new Error("超过当前管径表范围。");
  }
  function pipeOuterDiameterM(v) {
    const index = NOMINAL_SIZES.indexOf(v.nominalSize);
    if (v.pipeClass === "DIN 2448" && index >= 0) return PIPE_OD_DIN[index] / 1000;
    return pipeDiameter(v) * 1.08;
  }
  function condensatePipingStart(v, steamProps, length, minutes) {
    const id = pipeDiameter(v);
    const od = pipeOuterDiameterM(v);
    const thickness = diameterM(v.thickness, v.thicknessUnit || "mm");
    const steelMass = Math.max(Math.PI / 4 * (od * od - id * id) * length * 7850, 0);
    const warmup = steelMass * 0.577 * Math.max(steamProps.t - 20, 0) / Math.max(steamProps.hfg, 1);
    const baseOuter = 0.0889 + 2 * 0.05;
    const outerInsulated = od + 2 * Math.max(thickness, 0);
    const heatLossDiameter = thickness <= 0 ? baseOuter : outerInsulated;
    const temperatureFactor = Math.pow(Math.max(steamProps.t - 20, 1) / 150.4, 0.58);
    const diameterFactor = Math.pow(Math.max(heatLossDiameter, 0.001) / baseOuter, 1.55);
    const thicknessFactor = Math.exp(Math.log(9.657) * Math.max(0.05 - thickness, 0) / 0.05);
    const materialFactor = ({ "岩棉": 1, "玻璃棉": 0.98, "硅酸钙": 1.14, "珠光体": 1.08 }[v.insulation] || 1);
    const radiation = 4.22728 * (length / 100) * (minutes / 30) * temperatureFactor * diameterFactor * thicknessFactor * materialFactor;
    return { warmup, radiation, total: warmup + radiation };
  }
  function recoveryLineProps(v) {
    const s1 = steamAtPressure(pressureAbs(v.p1, v.p1Unit));
    const s2 = steamAtPressure(pressureAbs(v.p2, v.p2Unit));
    const flashPct = Math.max(0, (s1.hf - s2.hf) / s2.hfg);
    const specificVolume = flashPct * s2.vg + (1 - flashPct) * 0.00105;
    return {
      flow: massFlow(v.cond, v.condUnit),
      length: lengthM(v.length, v.lengthUnit),
      flashPct,
      specificVolume
    };
  }
  function selectRecoveryPipe(pipeClass, props, predicate) {
    const list = PIPE_D[pipeClass] || PIPE_D["DIN 2448"];
    for (let i = 0; i < list.length; i++) {
      const diameterMm = list[i];
      if (!diameterMm) continue;
      const d = diameterMm / 1000;
      const velocity = 4 * props.flow * props.specificVolume / (3600 * Math.PI * d * d);
      const density = 1 / Math.max(props.specificVolume, 1e-9);
      const dp = pressureDropBar(d, props.length, velocity, density, 0.00005) * RECOVERY_LINE_DP_FACTOR;
      const candidate = { size: NOMINAL_SIZES[i], diameterMm, velocity, dp };
      if (predicate(candidate)) return candidate;
    }
    throw new Error("超过当前管径表范围。");
  }
  function recoveryEconomics(v, mode) {
    const steam = steamAtPressure(pressureAbs(v.steamPressure, v.steamPressureUnit));
    const cond = steamAtPressure(pressureAbs(v.condPressure, v.condPressureUnit));
    const mc = massFlow(v.cond, v.condUnit);
    const mfw = massFlow(v.feedFlow, v.feedFlowUnit);
    const hfw = WATER_CP * temperatureC(v.feedTemp, v.feedTempUnit);
    const cv = fuelHeatKjKg(v.cv, v.cvUnit);
    const eta = Number(v.eff) / 100;
    const ce = energyCostRmbMj(v.energyCost, v.energyCostUnit);
    const hours = timeMinutes(v.hours, v.hoursUnit) / 60;
    let recoveredKjH = 0;
    let unrecoveredKjH = 0;
    let finalFeedTemp = temperatureC(v.feedTemp, v.feedTempUnit);
    let flashFlow = 0;
    if (mode === "open") {
      const maxHfw = WATER_CP * temperatureC(v.maxFeedTemp, v.maxFeedTempUnit);
      const mixedH = (mc * cond.hf + Math.max(mfw - mc, 0) * hfw) / Math.max(mfw, 1e-9);
      const recoveredH = Math.min(mixedH, maxHfw);
      recoveredKjH = mfw * Math.max(recoveredH - hfw, 0);
      unrecoveredKjH = mfw * Math.max(mixedH - maxHfw, 0);
      finalFeedTemp = recoveredH / WATER_CP;
    } else if (mode === "closed") {
      recoveredKjH = mc * Math.max(cond.hf - hfw, 0) * CLOSED_RECOVERY_HEAT_FACTOR;
    } else {
      const flash = steamAtPressure(pressureAbs(v.flashPressure, v.flashPressureUnit));
      const rawH = WATER_CP * temperatureC(v.rawTemp, v.rawTempUnit);
      const flashPct = Math.max(0, (cond.hf - flash.hf) / flash.hfg);
      flashFlow = mc * flashPct;
      recoveredKjH = flashFlow * Math.max(flash.hg - rawH, 0);
    }
    const recoveredW = recoveredKjH * 1000 / 3600;
    const annualFuel = recoveredKjH * hours / Math.max(cv * eta, 1e-9);
    const annualSavingK = annualFuel * ce * cv * eta / 1000000;
    const baseHeatKjH = mfw * Math.max(steam.hg - hfw, 1e-9);
    const fuelSavingPct = recoveredKjH / baseHeatKjH * 100;
    const rows = [["回收的热量", recoveredW, "W"], ["燃料年节约量", annualFuel, "kg/yr"], ["燃料节约%", fuelSavingPct, "%"]];
    if (mode === "open") rows.push(["不可回收热量", unrecoveredKjH * 1000 / 3600, "W"], ["锅炉给水温度", finalFeedTemp, "degC"]);
    if (mode === "flash") rows.push(["闪蒸汽流量", flashFlow, "kg/h"]);
    return result("燃料节约值", annualSavingK, "x1000RMB/yr", rows);
  }
  function saturatedWaterVolume(t) {
    const c = Number(t);
    return 0.00104344 + Math.max(c - 99.9743, 0) * 9.18e-7;
  }
  function equivalentLength(baseLengthM, diameterMValue, v) {
    const globe = Number(v.globe || 0) * 600;
    const gate = Number(v.gate || 0) * 8;
    const check = Number(v.check || 0) * 100;
    const elbow = Number(v.elbow || 0) * 38;
    return baseLengthM + (globe + gate + check + elbow) * diameterMValue;
  }
  function pressureDropBar(diameter, length, velocity, density, roughnessM) {
    if (length <= 0 || velocity <= 0) return 0;
    const viscosity = 1.5e-5;
    const reynolds = Math.max(density * velocity * diameter / viscosity, 1);
    const relativeRoughness = Math.max(roughnessM / diameter, 0);
    const friction = 1 / Math.pow(-1.8 * Math.log10(Math.pow(relativeRoughness / 3.7, 1.11) + 6.9 / reynolds), 2);
    return friction * (length / diameter) * density * velocity * velocity / 2 / 100000;
  }
  function fmt(v, digits = 3) {
    if (!Number.isFinite(Number(v))) return String(v);
    return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : digits }).format(Number(v));
  }

  window.steamToolbox = { tools, steamAtPressure, pressureAbs, PIPE_D };
  init();
})();
