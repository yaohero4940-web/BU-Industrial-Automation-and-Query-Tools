(function () {
  const C = {
    rhoW: 1000,
    cpW: 4.1868,
    pAtm: 101.325,
    cpA: 1.005,
    rhoA: 1.2,
    rt: 3.51685,
    g: 9.81,
    nuW: 1e-6
  };

  const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
  let lang = "en";
  const state = { toolId: "chiller", mode: "capacity", values: {} };

  const ui = {
    en: {
      brandTitle: "Refrigeration engineering calculator toolbox",
      navCalculator: "Calculators",
      navAudit: "Formula check",
      heroTitle: "A verifiable engineering workspace for refrigeration plant calculations",
      heroCopy: "Covers chillers, cooling towers, water piping, pumps, psychrometrics, AHU cooling coils, chilled-water storage, COP, cycles of concentration, and cleanroom outdoor-air loads. Each tool shows intermediate values, unit conversions, operating boundaries, and common input warnings.",
      toolCountLabel: "Tools organized",
      toolCountCopy: "Uses one set of constants, units, and validation rules.",
      constWaterDensity: "Water density 1000 kg/m3",
      constWaterCp: "Water cp 4.1868 kJ/(kg.C)",
      constAirCp: "Air cp 1.005 kJ/(kg.C)",
      constAtm: "Standard pressure 101.325 kPa",
      menuTitle: "Calculator directory",
      searchPlaceholder: "Search: capacity, pump, psychrometrics, AHU...",
      results: "Results",
      formulaNotes: "Formula and corrections",
      boundaries: "Engineering boundaries",
      print: "Print sheet",
      ready: "Ready",
      usable: "Ready",
      warn: "Check warnings",
      danger: "Fix inputs",
      langButton: "中文",
      auditTitle: "Checks and refinements applied to the draft formulas",
      audit1Title: "Psychrometric enthalpy unit fixed",
      audit1Copy: "When humidity ratio is displayed in g/kg dry air, enthalpy must use kg/kg: h = 1.005t + w(2501 + 1.86t), where w = d/1000.",
      audit2Title: "Wet-bulb relation corrected",
      audit2Copy: "Uses Pv = Pws(twb) - A P (tdb - twb), where A = 0.00066(1 + 0.00115twb), with pressure in kPa.",
      audit3Title: "Pipe friction factor completed",
      audit3Copy: "Laminar flow uses 64/Re; turbulent flow uses the Swamee-Jain explicit formula so lambda is computable.",
      audit4Title: "Cooling tower blowdown clarified",
      audit4Copy: "Recommended balance: Qb = Qe/(N - 1) - Qwind. A conservative draft method is also shown for comparison.",
      audit5Title: "Outdoor-air humidification converted",
      audit5Copy: "Msteam = m_oa x 3600 x (d_room - d_out) / 1000, avoiding a 1000x error from treating g as kg.",
      audit6Title: "Result validity warnings added",
      audit6Copy: "Inline warnings cover negative temperature differences, N <= 1, Pv above saturation, invalid efficiency, and Reynolds transition ranges."
    },
    zh: {
      brandTitle: "动力制冷专业计算工具集",
      navCalculator: "计算器",
      navAudit: "公式校核",
      heroTitle: "把制冷站常用估算公式做成可复核的工程工作台",
      heroCopy: "覆盖冷水机组、冷却塔、水管阻力、水泵、焓湿图、AHU 表冷段、蓄冷水箱、COP、浓缩倍数和洁净车间新风热湿负荷。每个工具同时输出关键中间量、单位换算、适用边界和常见错误提醒。",
      toolCountLabel: "已整理工具",
      toolCountCopy: "采用统一常数、统一单位和同一套校核规则。",
      constWaterDensity: "水密度 1000 kg/m3",
      constWaterCp: "水比热 4.1868 kJ/(kg.C)",
      constAirCp: "空气定压比热 1.005 kJ/(kg.C)",
      constAtm: "标准大气压 101.325 kPa",
      menuTitle: "计算目录",
      searchPlaceholder: "搜索：冷量、水泵、焓湿、AHU...",
      results: "计算结果",
      formulaNotes: "公式与修正说明",
      boundaries: "工程边界",
      print: "打印计算书",
      ready: "待输入",
      usable: "结果可用",
      warn: "有校核提醒",
      danger: "需修正输入",
      langButton: "EN",
      auditTitle: "对初稿公式的校核与深化",
      audit1Title: "湿空气焓单位已修正",
      audit1Copy: "含湿量若以 g/kg 干空气显示，焓计算必须使用 kg/kg：h = 1.005t + w(2501 + 1.86t)，其中 w = d/1000。",
      audit2Title: "湿球公式改为通用通风干湿表形式",
      audit2Copy: "采用 Pv = Pws(twb) - A P (tdb - twb)，A = 0.00066(1 + 0.00115twb)，单位为 kPa。",
      audit3Title: "水管摩擦系数补全",
      audit3Copy: "层流用 64/Re，湍流用 Swamee-Jain 显式公式，避免原式中 lambda 无来源导致无法计算。",
      audit4Title: "冷却塔排污给出两种口径",
      audit4Copy: "推荐质量平衡：Qb = Qe/(N - 1) - Qwind；同时保留初稿的保守算法供对照。",
      audit5Title: "新风加湿量已做 g/kg 换算",
      audit5Copy: "Msteam = m_oa x 3600 x (d_room - d_out) / 1000，避免把 g 当 kg 放大 1000 倍。",
      audit6Title: "增加结果有效性提示",
      audit6Copy: "对负温差、N <= 1、Pv 超过饱和压、效率越界、Re 区间等场景做内联提醒。"
    }
  };

  const enText = {
    "冷源系统": "Chilled-water plant",
    "冷却水系统": "Condenser-water system",
    "水力系统": "Hydronic system",
    "空气侧": "Air-side",
    "冷量储存": "Cooling storage",
    "能效": "Energy efficiency",
    "水处理": "Water treatment",
    "洁净车间": "Cleanroom",
    "冷水机组制冷量/水流量": "Chiller capacity / chilled-water flow",
    "冷却塔散热与补水量": "Cooling tower heat rejection and makeup water",
    "水管沿程阻力与局部阻力": "Water pipe friction and local resistance",
    "水泵轴功率与电机功率": "Pump shaft power and motor power",
    "焓湿图核心计算": "Core psychrometric calculation",
    "AHU 表冷段除湿冷负荷": "AHU cooling-coil dehumidification load",
    "蓄冷/缓冲水箱容积": "Cooling storage / buffer tank volume",
    "冷水机组 COP 与单位能耗": "Chiller COP and unit energy use",
    "循环水浓缩倍数与年耗水量": "Cycles of concentration and annual water use",
    "洁净车间新风热湿负荷": "Cleanroom outdoor-air thermal and moisture load",
    "流量求冷量": "Flow to capacity",
    "冷量求流量": "Capacity to flow",
    "水侧求冷量": "Water-side capacity",
    "直接输入冷量": "Direct capacity input",
    "冷冻水流量": "Chilled-water flow",
    "供水温度": "Supply-water temperature",
    "回水温度": "Return-water temperature",
    "制冷量": "Cooling capacity",
    "也可用 RT x 3.51685 换算": "Can also convert from RT x 3.51685",
    "循环水量": "Circulating water flow",
    "进塔水温": "Tower entering water temperature",
    "出塔水温": "Tower leaving water temperature",
    "室外湿球温度": "Outdoor wet-bulb temperature",
    "浓缩倍数 N": "Cycles of concentration N",
    "漂水率": "Drift rate",
    "管内径 D": "Pipe inside diameter D",
    "流量": "Flow rate",
    "管长 L": "Pipe length L",
    "绝对粗糙度 epsilon": "Absolute roughness epsilon",
    "焊接钢管可先取 0.00015 m": "Use 0.00015 m as an initial value for welded steel pipe",
    "局部阻力系数合计": "Sum of local loss coefficients",
    "扬程": "Head",
    "水泵效率": "Pump efficiency",
    "电机安全系数": "Motor safety factor",
    "干球温度": "Dry-bulb temperature",
    "湿球温度": "Wet-bulb temperature",
    "大气压": "Atmospheric pressure",
    "送风量": "Supply airflow",
    "空气密度": "Air density",
    "进风焓": "Entering-air enthalpy",
    "出风焓": "Leaving-air enthalpy",
    "冷冻水温差": "Chilled-water temperature difference",
    "蓄冷量单位": "Storage energy unit",
    "工程现场更常用 kWh": "kWh is more common in field calculations",
    "所需蓄冷量": "Required storage energy",
    "可用温差": "Usable temperature difference",
    "容积安全系数": "Volume safety factor",
    "若现场已有冷量表或能管系统数据，可直接输入": "Use this when a cooling meter or energy-management system already provides capacity",
    "冷冻水供水温度": "Chilled-water supply temperature",
    "冷冻水回水温度": "Chilled-water return temperature",
    "压缩机/机组输入功率": "Compressor / chiller input power",
    "注意区分压缩机功率、机组功率和系统总功率": "Distinguish compressor power, chiller power, and whole-system power",
    "日运行小时数": "Daily operating hours",
    "蒸发损失": "Evaporation loss",
    "漂水损失": "Drift loss",
    "循环水 TDS": "Circulating-water TDS",
    "补水 TDS": "Makeup-water TDS",
    "年运行小时数": "Annual operating hours",
    "新风风量": "Outdoor airflow",
    "室外焓": "Outdoor-air enthalpy",
    "室内设计焓": "Room design enthalpy",
    "冬季室外温度": "Winter outdoor temperature",
    "室内温度": "Room temperature",
    "室外含湿量": "Outdoor humidity ratio",
    "室内含湿量": "Room humidity ratio",
    "质量流量": "Mass flow",
    "折合冷吨": "Refrigeration tons",
    "每 m3/h 冷量": "Capacity per m3/h",
    "所需水流量": "Required water flow",
    "采用温差": "Applied temperature difference",
    "总散热量": "Total heat rejection",
    "排污量-质量平衡": "Blowdown - mass balance",
    "总补水量": "Total makeup water",
    "接近度": "Approach",
    "保守排污对照": "Conservative blowdown comparison",
    "流速": "Velocity",
    "雷诺数": "Reynolds number",
    "摩擦系数 lambda": "Friction factor lambda",
    "沿程阻力": "Friction pressure loss",
    "局部阻力": "Local pressure loss",
    "总压力损失": "Total pressure loss",
    "水柱高度": "Water head",
    "水力功率": "Hydraulic power",
    "轴功率": "Shaft power",
    "建议电机功率": "Recommended motor power",
    "小时耗电量": "Hourly electricity use",
    "日耗电量": "Daily electricity use",
    "日耗电量": "Daily electricity use",
    "饱和水汽压": "Saturation vapor pressure",
    "水汽分压力": "Vapor partial pressure",
    "相对湿度": "Relative humidity",
    "含湿量": "Humidity ratio",
    "空气焓": "Air enthalpy",
    "露点温度": "Dew-point temperature",
    "空气质量流量": "Air mass flow",
    "表冷总冷量": "Cooling-coil total load",
    "所需冷冻水流量": "Required chilled-water flow",
    "单位风量冷量": "Load per airflow",
    "蓄冷量": "Storage energy",
    "蓄冷水质量": "Stored water mass",
    "有效容积": "Effective volume",
    "建议总容积": "Recommended total volume",
    "冷冻水温差": "Chilled-water temperature difference",
    "水侧质量流量": "Water-side mass flow",
    "水侧制冷量": "Water-side cooling capacity",
    "输入制冷量": "Input cooling capacity",
    "单位冷量电耗": "Unit energy use",
    "浓缩倍数 N": "Cycles of concentration N",
    "排污量": "Blowdown",
    "年耗水量": "Annual water use",
    "新风质量流量": "Outdoor-air mass flow",
    "夏季新风冷负荷": "Summer outdoor-air cooling load",
    "冬季显热加热负荷": "Winter sensible heating load",
    "加湿蒸汽耗量": "Humidification steam demand",
    "由冷冻水流量和供回水温差计算制冷量，或由目标冷量反推所需水流量。": "Calculates cooling capacity from chilled-water flow and supply/return temperature difference, or back-calculates required water flow from target capacity.",
    "计算冷却塔散热量、蒸发损失、漂水、排污和总补水量，并对接近度与浓缩倍数做校核。": "Calculates cooling tower heat rejection, evaporation, drift, blowdown, and makeup water, with approach and concentration checks.",
    "基于 Darcy-Weisbach 公式计算冷冻/冷却水管流速、雷诺数、摩擦系数、沿程阻力、局部阻力和水柱高度。": "Uses Darcy-Weisbach to calculate water-pipe velocity, Reynolds number, friction factor, friction loss, local loss, and water head.",
    "由流量、扬程和水泵效率估算水力功率、轴功率、建议电机功率和运行电耗。": "Estimates hydraulic power, shaft power, recommended motor power, and electricity use from flow, head, and pump efficiency.",
    "由干球、湿球和大气压计算相对湿度、含湿量、空气焓和露点温度。": "Calculates relative humidity, humidity ratio, air enthalpy, and dew point from dry bulb, wet bulb, and pressure.",
    "由送风量和进出风焓差计算表冷段总冷量，并反推冷冻水流量。": "Calculates AHU cooling-coil total load from airflow and enthalpy difference, then back-calculates chilled-water flow.",
    "支持以 kJ 或 kWh 输入蓄冷量，计算有效水量和带安全余量的水箱总容积。": "Accepts storage energy in kJ or kWh and calculates effective water volume plus safety margin.",
    "优先由冷冻水流量和供回水温差计算实际制冷量，再结合机组输入功率计算 COP、kW/RT 和日电耗；也支持直接输入已知冷量。": "By default, derives actual cooling capacity from chilled-water flow and supply/return temperatures, then calculates COP, kW/RT, and daily electricity use. Direct capacity input is also available.",
    "由蒸发量、漂水量和浓缩倍数计算排污、补水与年耗水量，并支持由 TDS 反算浓缩倍数。": "Calculates blowdown, makeup water, and annual water use from evaporation, drift, and cycles of concentration; TDS can also derive N.",
    "计算夏季新风冷负荷、冬季显热加热负荷和加湿蒸汽耗量。": "Calculates summer outdoor-air cooling load, winter sensible heating load, and humidification steam demand."
    ,
    "回水温度必须高于供水温度，否则制冷量或反算流量没有工程意义。": "Return-water temperature must be higher than supply-water temperature; otherwise cooling capacity or reverse flow calculation is not meaningful.",
    "进塔水温应高于出塔水温。": "Tower entering water temperature should be higher than leaving water temperature.",
    "出塔水温距离湿球温度小于 2 degC，通常需要复核塔型和气水比。": "Tower leaving-water temperature is within 2 degC of wet bulb; tower selection and air/water ratio should be checked.",
    "浓缩倍数 N 必须大于 1。": "Cycles of concentration N must be greater than 1.",
    "水流速超过 3 m/s，噪声、冲刷和压降可能偏大。": "Water velocity exceeds 3 m/s; noise, erosion, and pressure drop may be high.",
    "雷诺数处于过渡区，摩擦系数存在不确定性。": "Reynolds number is in the transition range, so the friction factor is uncertain.",
    "管径必须大于 0。": "Pipe diameter must be greater than 0.",
    "水泵效率应输入 0-1 之间的小数。": "Pump efficiency should be entered as a decimal between 0 and 1.",
    "电机安全系数小于 1，通常不建议这样选型。": "Motor safety factor is below 1; this is generally not recommended.",
    "湿球温度不应高于干球温度。": "Wet-bulb temperature should not be higher than dry-bulb temperature.",
    "计算得到的水汽分压力小于 0，请检查干湿球输入。": "Calculated vapor partial pressure is below 0; check dry-bulb and wet-bulb inputs.",
    "计算相对湿度超过 100%，已按过饱和状态显示，建议复核湿球读数。": "Calculated relative humidity exceeds 100%; the state is shown as supersaturated, so verify the wet-bulb reading.",
    "进风焓应高于出风焓，否则不是冷却除湿过程。": "Entering-air enthalpy should be higher than leaving-air enthalpy for a cooling/dehumidification process.",
    "冷冻水温差必须大于 0。": "Chilled-water temperature difference must be greater than 0.",
    "蓄冷可用温差必须大于 0。": "Usable storage temperature difference must be greater than 0.",
    "可用温差小于 3 degC，水箱容积会明显增大，建议复核控制策略。": "Usable temperature difference is below 3 degC, so tank volume will increase significantly; check the control strategy.",
    "输入功率必须大于 0。": "Input power must be greater than 0.",
    "冷冻水回水温度必须高于供水温度，否则水侧制冷量无法成立。": "Chilled-water return temperature must be higher than supply temperature; otherwise water-side cooling capacity is invalid.",
    "供回水温差小于 2 degC，冷量对温度传感器误差非常敏感，建议核对温度点位。": "Supply/return DeltaT is below 2 degC; capacity is very sensitive to temperature-sensor error, so verify sensor locations.",
    "COP 偏低，需确认是否只输入了压缩机功率、是否含辅机功率以及工况条件。": "COP is low; confirm whether input power is compressor-only, includes auxiliaries, and matches the operating condition.",
    "由 TDS 计算得到的浓缩倍数 <= 1，无法形成有效排污计算。": "Cycles of concentration calculated from TDS is <= 1, so blowdown calculation is invalid.",
    "室外焓低于室内焓，夏季新风冷负荷为负，可能是过渡季或输入工况不一致。": "Outdoor-air enthalpy is lower than room enthalpy, giving a negative summer cooling load; this may be shoulder-season operation or inconsistent inputs.",
    "室内目标含湿量低于室外含湿量，冬季加湿量按 0 显示。": "Room target humidity ratio is lower than outdoor humidity ratio; winter humidification is shown as 0."
  };

  const field = (id, label, value, unit, note = "", min = null) => ({ id, label, value, unit, note, min });
  const select = (id, label, value, options, note = "") => ({ id, label, value, options, note, type: "select" });

  const tools = [
    {
      id: "chiller",
      group: "冷源系统",
      title: "冷水机组制冷量/水流量",
      desc: "由冷冻水流量和供回水温差计算制冷量，或由目标冷量反推所需水流量。",
      modes: [
        { id: "capacity", label: "流量求冷量" },
        { id: "flow", label: "冷量求流量" }
      ],
      fields: (mode) => mode === "flow"
        ? [field("phi", "制冷量", 703.37, "kW", "也可用 RT x 3.51685 换算"), field("tg", "供水温度", 7, "degC"), field("th", "回水温度", 12, "degC")]
        : [field("qv", "冷冻水流量", 120, "m3/h"), field("tg", "供水温度", 7, "degC"), field("th", "回水温度", 12, "degC")],
      calc: (v, mode) => {
        const dt = v.th - v.tg;
        const warn = [];
        if (dt <= 0) warn.push(["danger", "回水温度必须高于供水温度，否则制冷量或反算流量没有工程意义。"]);
        if (mode === "flow") {
          const qv = 3600 * v.phi / (C.rhoW * C.cpW * Math.max(dt, 1e-9));
          return out([
            m("所需水流量", qv, "m3/h"),
            m("所需水流量", qv / 3.6, "L/s"),
            m("折合冷吨", v.phi / C.rt, "RT"),
            m("采用温差", dt, "degC")
          ], warn);
        }
        const mw = C.rhoW * v.qv / 3600;
        const phi = mw * C.cpW * Math.max(dt, 0);
        return out([
          m("质量流量", mw, "kg/s"),
          m("制冷量", phi, "kW"),
          m("折合冷吨", phi / C.rt, "RT"),
          m("每 m3/h 冷量", phi / Math.max(v.qv, 1e-9), "kW/(m3/h)")
        ], warn);
      },
      formula: "m_w = rho_w Qv/3600；Phi = m_w cp_w (t_h - t_g)；RT = Phi/3.51685。反算时 Qv = 3600 Phi/(rho_w cp_w DeltaT)。",
      boundary: "适合水侧显热换热估算。温差过小会导致反算流量很大；实际选型还要核对机组蒸发器允许流量范围和压降。"
    },
    {
      id: "tower",
      group: "冷却水系统",
      title: "冷却塔散热与补水量",
      desc: "计算冷却塔散热量、蒸发损失、漂水、排污和总补水量，并对接近度与浓缩倍数做校核。",
      fields: () => [
        field("qv", "循环水量", 180, "m3/h"), field("t1", "进塔水温", 37, "degC"), field("t2", "出塔水温", 32, "degC"),
        field("twb", "室外湿球温度", 28, "degC"), field("n", "浓缩倍数 N", 4, ""), field("drift", "漂水率", 0.001, "m3/m3")
      ],
      calc: (v) => {
        const dt = v.t1 - v.t2;
        const approach = v.t2 - v.twb;
        const qe = 0.0015 * v.qv * Math.max(dt, 0);
        const qwind = v.drift * v.qv;
        const qbBalanced = Math.max(qe / Math.max(v.n - 1, 1e-9) - qwind, 0);
        const qbConservative = (qe + qwind) / Math.max(v.n - 1, 1e-9);
        const qmake = qe + qwind + qbBalanced;
        const warn = [];
        if (dt <= 0) warn.push(["danger", "进塔水温应高于出塔水温。"]);
        if (approach < 2) warn.push(["warn", "出塔水温距离湿球温度小于 2 degC，通常需要复核塔型和气水比。"]);
        if (v.n <= 1) warn.push(["danger", "浓缩倍数 N 必须大于 1。"]);
        return out([
          m("总散热量", C.rhoW * v.qv / 3600 * C.cpW * Math.max(dt, 0), "kW"),
          m("蒸发损失", qe, "m3/h"),
          m("漂水损失", qwind, "m3/h"),
          m("排污量-质量平衡", qbBalanced, "m3/h"),
          m("总补水量", qmake, "m3/h"),
          m("接近度", approach, "degC"),
          m("保守排污对照", qbConservative, "m3/h")
        ], warn);
      },
      formula: "Phi = rho_w Qv cp_w (t1 - t2)/3600；Qe = 0.0015 Qv DeltaT；Qwind = drift Qv。推荐排污：Qb = Qe/(N - 1) - Qwind；若按保守口径，可用 (Qe + Qwind)/(N - 1)。",
      boundary: "补水估算与水质控制策略有关。漂水如果按浓缩水损失处理，应从排污中扣除；若业主标准要求保守水量，可采用保守口径。"
    },
    {
      id: "pipe",
      group: "水力系统",
      title: "水管沿程阻力与局部阻力",
      desc: "基于 Darcy-Weisbach 公式计算冷冻/冷却水管流速、雷诺数、摩擦系数、沿程阻力、局部阻力和水柱高度。",
      fields: () => [
        field("d", "管内径 D", 0.15, "m"), field("qv", "流量", 80, "m3/h"), field("l", "管长 L", 120, "m"),
        field("eps", "绝对粗糙度 epsilon", 0.00015, "m", "焊接钢管可先取 0.00015 m"), field("xi", "局部阻力系数合计", 12, "")
      ],
      calc: (v) => {
        const area = Math.PI * Math.pow(v.d / 2, 2);
        const vel = (v.qv / 3600) / Math.max(area, 1e-12);
        const re = vel * v.d / C.nuW;
        const lambda = frictionFactor(re, v.eps, v.d);
        const dyn = C.rhoW * vel * vel / 2;
        const dpf = lambda * v.l / Math.max(v.d, 1e-9) * dyn;
        const dpj = v.xi * dyn;
        const dpt = dpf + dpj;
        const warn = [];
        if (vel > 3) warn.push(["warn", "水流速超过 3 m/s，噪声、冲刷和压降可能偏大。"]);
        if (re > 2300 && re < 4000) warn.push(["warn", "雷诺数处于过渡区，摩擦系数存在不确定性。"]);
        if (v.d <= 0) warn.push(["danger", "管径必须大于 0。"]);
        return out([
          m("流速", vel, "m/s"),
          m("雷诺数", re, ""),
          m("摩擦系数 lambda", lambda, ""),
          m("沿程阻力", dpf / 1000, "kPa"),
          m("局部阻力", dpj / 1000, "kPa"),
          m("总压力损失", dpt / 1000, "kPa"),
          m("水柱高度", dpt / (C.rhoW * C.g), "mH2O")
        ], warn);
      },
      formula: "v = (Qv/3600)/(pi D^2/4)；Re = vD/nu。Darcy 阻力：DeltaP_f = lambda L/D rho v^2/2；DeltaP_j = Sigma xi rho v^2/2。lambda：层流 64/Re，湍流采用 Swamee-Jain 显式公式。",
      boundary: "这是管段估算，不含设备压降、过滤器压降、控制阀压差和换热器压降。实际泵扬程应把最不利环路全部计入。"
    },
    {
      id: "pump",
      group: "水力系统",
      title: "水泵轴功率与电机功率",
      desc: "由流量、扬程和水泵效率估算水力功率、轴功率、建议电机功率和运行电耗。",
      fields: () => [field("qv", "流量", 100, "m3/h"), field("h", "扬程", 32, "mH2O"), field("eta", "水泵效率", 0.72, ""), field("sf", "电机安全系数", 1.15, "")],
      calc: (v) => {
        const phyd = C.rhoW * C.g * v.qv * v.h / (3600 * 1000);
        const pshaft = phyd / Math.max(v.eta, 1e-9);
        const pmotor = pshaft * v.sf;
        const warn = [];
        if (v.eta <= 0 || v.eta > 1) warn.push(["danger", "水泵效率应输入 0-1 之间的小数。"]);
        if (v.sf < 1) warn.push(["warn", "电机安全系数小于 1，通常不建议这样选型。"]);
        return out([
          m("水力功率", phyd, "kW"),
          m("轴功率", pshaft, "kW"),
          m("建议电机功率", pmotor, "kW"),
          m("小时耗电量", pmotor, "kWh/h"),
          m("日耗电量", pmotor * 24, "kWh/d")
        ], warn);
      },
      formula: "P_hyd = rho_w g Qv H/(3600 x 1000)；P_shaft = P_hyd/eta_p；P_motor = P_shaft x safety factor。",
      boundary: "这是连续工况估算。变频泵、并联泵和部分负荷应结合泵曲线、系统曲线和控制策略计算。"
    },
    {
      id: "psych",
      group: "空气侧",
      title: "焓湿图核心计算",
      desc: "由干球、湿球和大气压计算相对湿度、含湿量、空气焓和露点温度。",
      fields: () => [field("tdb", "干球温度", 26, "degC"), field("twb", "湿球温度", 19, "degC"), field("p", "大气压", 101.325, "kPa")],
      calc: (v) => {
        const ps = satPressure(v.tdb);
        const pswb = satPressure(v.twb);
        const a = 0.00066 * (1 + 0.00115 * v.twb);
        let pv = pswb - a * v.p * (v.tdb - v.twb);
        const warn = [];
        if (v.twb > v.tdb) warn.push(["danger", "湿球温度不应高于干球温度。"]);
        if (pv <= 0) {
          warn.push(["danger", "计算得到的水汽分压力小于 0，请检查干湿球输入。"]);
          pv = 1e-6;
        }
        if (pv > ps) warn.push(["warn", "计算相对湿度超过 100%，已按过饱和状态显示，建议复核湿球读数。"]);
        const rh = pv / ps * 100;
        const w = 0.62198 * pv / Math.max(v.p - pv, 1e-9);
        const d = w * 1000;
        const h = C.cpA * v.tdb + w * (2501 + 1.86 * v.tdb);
        return out([
          m("饱和水汽压", ps, "kPa"),
          m("水汽分压力", pv, "kPa"),
          m("相对湿度", rh, "%"),
          m("含湿量", d, "g/kg dry air"),
          m("空气焓", h, "kJ/kg dry air"),
          m("露点温度", dewPointFromPv(pv), "degC")
        ], warn);
      },
      formula: "Pws = 0.61078 exp(17.27t/(t + 237.3))；Pv = Pws(twb) - 0.00066(1 + 0.00115twb) P (tdb - twb)；d = 621.98 Pv/(P - Pv) g/kg；h = 1.005t + (d/1000)(2501 + 1.86t)。",
      boundary: "适合常压附近 HVAC 估算。高海拔、低温结冰湿球、喷淋室或高精度洁净室校核建议使用完整湿空气物性库。"
    },
    {
      id: "ahu",
      group: "空气侧",
      title: "AHU 表冷段除湿冷负荷",
      desc: "由送风量和进出风焓差计算表冷段总冷量，并反推冷冻水流量。",
      fields: () => [field("l", "送风量", 20000, "m3/h"), field("rho", "空气密度", 1.2, "kg/m3"), field("h1", "进风焓", 67, "kJ/kg"), field("h2", "出风焓", 42, "kJ/kg"), field("dtw", "冷冻水温差", 5, "degC")],
      calc: (v) => {
        const ma = v.rho * v.l / 3600;
        const phi = ma * (v.h1 - v.h2);
        const qw = 3600 * phi / (C.rhoW * C.cpW * Math.max(v.dtw, 1e-9));
        const warn = [];
        if (v.h1 <= v.h2) warn.push(["danger", "进风焓应高于出风焓，否则不是冷却除湿过程。"]);
        if (v.dtw <= 0) warn.push(["danger", "冷冻水温差必须大于 0。"]);
        return out([
          m("空气质量流量", ma, "kg/s"),
          m("表冷总冷量", phi, "kW"),
          m("折合冷吨", phi / C.rt, "RT"),
          m("所需冷冻水流量", qw, "m3/h"),
          m("单位风量冷量", phi / Math.max(v.l / 1000, 1e-9), "kW/(1000 m3/h)")
        ], warn);
      },
      formula: "m_a = rho_a L/3600；Phi_AHU = m_a(h1 - h2)；Q_water = 3600 Phi_AHU/(rho_w cp_w DeltaT_w)。",
      boundary: "h1、h2 应来自同一大气压下的湿空气计算。若含风机温升、再热或旁通，应拆分到对应段。"
    },
    {
      id: "storage",
      group: "冷量储存",
      title: "蓄冷/缓冲水箱容积",
      desc: "支持以 kJ 或 kWh 输入蓄冷量，计算有效水量和带安全余量的水箱总容积。",
      fields: () => [select("unitMode", "蓄冷量单位", "kWh", ["kWh", "kJ"], "工程现场更常用 kWh"), field("store", "所需蓄冷量", 100, ""), field("dt", "可用温差", 5, "degC"), field("sf", "容积安全系数", 1.2, "")],
      calc: (v) => {
        const storeKj = v.unitMode === "kWh" ? v.store * 3600 : v.store;
        const mass = storeKj / (C.cpW * Math.max(v.dt, 1e-9));
        const veff = mass / C.rhoW;
        const warn = [];
        if (v.dt <= 0) warn.push(["danger", "蓄冷可用温差必须大于 0。"]);
        if (v.dt < 3) warn.push(["warn", "可用温差小于 3 degC，水箱容积会明显增大，建议复核控制策略。"]);
        return out([
          m("蓄冷量", storeKj, "kJ"),
          m("蓄冷水质量", mass, "kg"),
          m("有效容积", veff, "m3"),
          m("建议总容积", veff * v.sf, "m3")
        ], warn);
      },
      formula: "M = Phi_store/(cp_w DeltaT)；V_eff = M/rho_w；V_total = V_eff x safety factor。若输入 kWh，先乘以 3600 转为 kJ。",
      boundary: "仅适合水箱缓冲或水蓄冷粗算。冰蓄冷、相变材料、分层水箱和可用放冷效率需要另建模型。"
    },
    {
      id: "cop",
      group: "能效",
      title: "冷水机组 COP 与单位能耗",
      desc: "优先由冷冻水流量和供回水温差计算实际制冷量，再结合机组输入功率计算 COP、kW/RT 和日电耗；也支持直接输入已知冷量。",
      modes: [
        { id: "water", label: "水侧求冷量" },
        { id: "direct", label: "直接输入冷量" }
      ],
      fields: (mode) => mode === "direct"
        ? [field("phi", "制冷量", 703.37, "kW", "若现场已有冷量表或能管系统数据，可直接输入"), field("pin", "压缩机/机组输入功率", 125, "kW"), field("hours", "日运行小时数", 24, "h/d")]
        : [
          field("qv", "冷冻水流量", 120, "m3/h", "可取流量计、BAS 趋势或一次泵/二次泵实测流量"),
          field("tg", "冷冻水供水温度", 7, "degC"),
          field("th", "冷冻水回水温度", 12, "degC"),
          field("pin", "压缩机/机组输入功率", 125, "kW", "注意区分压缩机功率、机组功率和系统总功率"),
          field("hours", "日运行小时数", 24, "h/d")
        ],
      calc: (v, mode) => {
        const dt = mode === "direct" ? null : v.th - v.tg;
        const phi = mode === "direct" ? v.phi : C.rhoW * v.qv / 3600 * C.cpW * Math.max(dt, 0);
        const cop = phi / Math.max(v.pin, 1e-9);
        const rt = phi / C.rt;
        const warn = [];
        if (v.pin <= 0) warn.push(["danger", "输入功率必须大于 0。"]);
        if (mode !== "direct" && dt <= 0) warn.push(["danger", "冷冻水回水温度必须高于供水温度，否则水侧制冷量无法成立。"]);
        if (mode !== "direct" && Math.abs(dt) < 2) warn.push(["warn", "供回水温差小于 2 degC，冷量对温度传感器误差非常敏感，建议核对温度点位。"]);
        if (cop < 2.5) warn.push(["warn", "COP 偏低，需确认是否只输入了压缩机功率、是否含辅机功率以及工况条件。"]);
        const metrics = [
          ...(mode === "direct" ? [] : [
            m("冷冻水温差", dt, "degC"),
            m("水侧质量流量", C.rhoW * v.qv / 3600, "kg/s")
          ]),
          m(mode === "direct" ? "输入制冷量" : "水侧制冷量", phi, "kW"),
          m("COP", cop, ""),
          m("制冷量", rt, "RT"),
          m("单位冷量电耗", v.pin / Math.max(rt, 1e-9), "kW/RT"),
          m("单位冷量电耗", v.pin / Math.max(rt, 1e-9), "kWh/RT.h"),
          m("日耗电量", v.pin * v.hours, "kWh/d")
        ];
        return out(metrics, warn);
      },
      formula: "水侧冷量：m_w = rho_w Qv/3600，Phi = m_w cp_w (t_return - t_supply)。能效：COP = Phi/P_in；RT = Phi/3.51685；E_unit = P_in/RT；E_day = P_in x operating hours。",
      boundary: "水侧法依赖流量计和供回水温度精度，低温差工况误差会被放大。要区分压缩机 COP、机组 COP 和系统 COP；若输入功率包含冷冻泵、冷却泵、冷却塔风机，结果应称为系统能效。"
    },
    {
      id: "cycles",
      group: "水处理",
      title: "循环水浓缩倍数与年耗水量",
      desc: "由蒸发量、漂水量和浓缩倍数计算排污、补水与年耗水量，并支持由 TDS 反算浓缩倍数。",
      fields: () => [field("qe", "蒸发损失", 1.35, "m3/h"), field("qwind", "漂水损失", 0.18, "m3/h"), field("tdsCir", "循环水 TDS", 1200, "mg/L"), field("tdsMake", "补水 TDS", 300, "mg/L"), field("hours", "年运行小时数", 8760, "h/y")],
      calc: (v) => {
        const n = v.tdsCir / Math.max(v.tdsMake, 1e-9);
        const qb = Math.max(v.qe / Math.max(n - 1, 1e-9) - v.qwind, 0);
        const qm = v.qe + v.qwind + qb;
        const warn = [];
        if (n <= 1) warn.push(["danger", "由 TDS 计算得到的浓缩倍数 <= 1，无法形成有效排污计算。"]);
        return out([
          m("浓缩倍数 N", n, ""),
          m("排污量", qb, "m3/h"),
          m("总补水量", qm, "m3/h"),
          m("年耗水量", qm * v.hours, "m3/y"),
          m("保守排污对照", (v.qe + v.qwind) / Math.max(n - 1, 1e-9), "m3/h")
        ], warn);
      },
      formula: "N = TDS_cir/TDS_make。推荐质量平衡：Qb = Qe/(N - 1) - Qwind；Qm = Qe + Qwind + Qb；Q_year = Qm x annual hours。",
      boundary: "TDS 只能代表总溶解固体趋势，实际水处理还要校核硬度、碱度、氯离子、硅、药剂控制和排污控制逻辑。"
    },
    {
      id: "oa",
      group: "洁净车间",
      title: "洁净车间新风热湿负荷",
      desc: "计算夏季新风冷负荷、冬季显热加热负荷和加湿蒸汽耗量。",
      fields: () => [
        field("l", "新风风量", 5000, "m3/h"), field("hout", "室外焓", 85, "kJ/kg"), field("hroom", "室内设计焓", 48, "kJ/kg"),
        field("tout", "冬季室外温度", -5, "degC"), field("troom", "室内温度", 22, "degC"), field("dout", "室外含湿量", 1.5, "g/kg"), field("droom", "室内含湿量", 8, "g/kg")
      ],
      calc: (v) => {
        const ma = C.rhoA * v.l / 3600;
        const cold = ma * (v.hout - v.hroom);
        const heat = ma * C.cpA * (v.troom - v.tout);
        const steam = ma * 3600 * Math.max(v.droom - v.dout, 0) / 1000;
        const warn = [];
        if (v.hout < v.hroom) warn.push(["warn", "室外焓低于室内焓，夏季新风冷负荷为负，可能是过渡季或输入工况不一致。"]);
        if (v.droom < v.dout) warn.push(["warn", "室内目标含湿量低于室外含湿量，冬季加湿量按 0 显示。"]);
        return out([
          m("新风质量流量", ma, "kg/s"),
          m("夏季新风冷负荷", cold, "kW"),
          m("冬季显热加热负荷", heat, "kW"),
          m("加湿蒸汽耗量", steam, "kg/h"),
          m("折合冷吨", cold / C.rt, "RT")
        ], warn);
      },
      formula: "m_oa = 1.2 L_OA/3600；Phi_OA,cold = m_oa(h_out - h_room)；Phi_OA,heat = m_oa cp_a(t_room - t_out)；M_steam = m_oa x 3600 x (d_room - d_out)/1000。",
      boundary: "洁净车间新风负荷通常还要叠加渗透、排风补偿、正压风量、过滤器阻力导致的风机温升和再热需求。"
    }
  ];

  const detailEn = {
    chiller: {
      formula: "m_w = rho_w Qv/3600; Phi = m_w cp_w (t_return - t_supply); RT = Phi/3.51685. Reverse calculation: Qv = 3600 Phi/(rho_w cp_w DeltaT).",
      boundary: "Suitable for water-side sensible cooling estimates. Very small temperature differences create very large back-calculated flows; final selection should check evaporator flow limits and pressure drop."
    },
    tower: {
      formula: "Phi = rho_w Qv cp_w (t1 - t2)/3600; Qe = 0.0015 Qv DeltaT; Qwind = drift Qv. Recommended blowdown: Qb = Qe/(N - 1) - Qwind. A conservative comparison uses (Qe + Qwind)/(N - 1).",
      boundary: "Makeup-water estimates depend on water-quality control strategy. If drift is treated as concentrated-water loss, subtract it from blowdown; if the owner standard is conservative, use the conservative method."
    },
    pipe: {
      formula: "v = (Qv/3600)/(pi D^2/4); Re = vD/nu. Darcy loss: DeltaP_f = lambda L/D rho v^2/2; DeltaP_j = Sigma xi rho v^2/2. lambda uses 64/Re for laminar flow and Swamee-Jain for turbulent flow.",
      boundary: "This is a pipe-segment estimate. It does not include equipment, strainers, control valves, or heat-exchanger pressure drops. Pump head should include the complete critical circuit."
    },
    pump: {
      formula: "P_hyd = rho_w g Qv H/(3600 x 1000); P_shaft = P_hyd/eta_p; P_motor = P_shaft x safety factor.",
      boundary: "This is a steady-duty estimate. Variable-speed pumps, parallel pumps, and part-load operation should be checked against pump and system curves."
    },
    psych: {
      formula: "Pws = 0.61078 exp(17.27t/(t + 237.3)); Pv = Pws(twb) - 0.00066(1 + 0.00115twb) P (tdb - twb); d = 621.98 Pv/(P - Pv) g/kg; h = 1.005t + (d/1000)(2501 + 1.86t).",
      boundary: "Suitable for HVAC estimates near normal atmospheric pressure. High altitude, freezing wet-bulb conditions, spray chambers, or high-precision cleanroom work should use a full psychrometric property library."
    },
    ahu: {
      formula: "m_a = rho_a L/3600; Phi_AHU = m_a(h1 - h2); Q_water = 3600 Phi_AHU/(rho_w cp_w DeltaT_w).",
      boundary: "h1 and h2 should come from psychrometric calculations at the same pressure. Fan heat, reheat, or bypass should be assigned to the correct process segment."
    },
    storage: {
      formula: "M = Phi_store/(cp_w DeltaT); V_eff = M/rho_w; V_total = V_eff x safety factor. If input is kWh, multiply by 3600 to convert to kJ.",
      boundary: "Only suitable for buffer tanks or rough chilled-water storage estimates. Ice storage, phase-change materials, stratified tanks, and usable discharge efficiency need separate models."
    },
    cop: {
      formula: "Water-side capacity: m_w = rho_w Qv/3600, Phi = m_w cp_w (t_return - t_supply). Efficiency: COP = Phi/P_in; RT = Phi/3.51685; E_unit = P_in/RT; E_day = P_in x operating hours.",
      boundary: "Water-side capacity depends on flow-meter and temperature-sensor accuracy; low DeltaT amplifies error. Distinguish compressor COP, chiller COP, and system COP. If pump and tower fan power are included, call the result system efficiency."
    },
    cycles: {
      formula: "N = TDS_cir/TDS_make. Recommended balance: Qb = Qe/(N - 1) - Qwind; Qm = Qe + Qwind + Qb; Q_year = Qm x annual hours.",
      boundary: "TDS only indicates the overall dissolved-solids trend. Actual water treatment also needs hardness, alkalinity, chloride, silica, chemical control, and blowdown-control checks."
    },
    oa: {
      formula: "m_oa = 1.2 L_OA/3600; Phi_OA,cold = m_oa(h_out - h_room); Phi_OA,heat = m_oa cp_a(t_room - t_out); M_steam = m_oa x 3600 x (d_room - d_out)/1000.",
      boundary: "Cleanroom outdoor-air loads often also need infiltration, exhaust makeup, positive-pressure airflow, filter-related fan heat, and reheat demand."
    }
  };

  const els = {
    menu: document.getElementById("toolMenu"),
    search: document.getElementById("toolSearch"),
    langToggle: document.getElementById("langToggle"),
    group: document.getElementById("toolGroup"),
    title: document.getElementById("toolTitle"),
    desc: document.getElementById("toolDesc"),
    mode: document.getElementById("modeSwitch"),
    form: document.getElementById("calculatorForm"),
    results: document.getElementById("resultOutput"),
    warnings: document.getElementById("warnOutput"),
    formula: document.getElementById("formulaOutput"),
    boundary: document.getElementById("boundaryOutput"),
    badge: document.getElementById("qualityBadge"),
    print: document.getElementById("printBtn")
  };

  function t(key) {
    return ui[lang][key] || ui.en[key] || key;
  }

  function tr(text) {
    if (lang === "zh") return text;
    return enText[text] || text;
  }

  function applyStaticI18n() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = lang === "zh" ? "动力制冷专业计算工具集" : "Refrigeration engineering calculator toolbox";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    els.search.placeholder = t("searchPlaceholder");
    els.langToggle.textContent = t("langButton");
  }

  function m(label, value, unit) {
    return { label, value, unit };
  }

  function out(metrics, warnings) {
    return { metrics, warnings };
  }

  function val(id) {
    const el = els.form.elements[id];
    if (!el) return 0;
    return el.tagName === "SELECT" ? el.value : Number(el.value);
  }

  function currentTool() {
    return tools.find((tool) => tool.id === state.toolId) || tools[0];
  }

  function renderMenu(filter = "") {
    const groups = new Map();
    tools
      .filter((tool) => `${tool.group} ${tool.title} ${tool.desc} ${tr(tool.group)} ${tr(tool.title)} ${tr(tool.desc)}`.toLowerCase().includes(filter.toLowerCase()))
      .forEach((tool) => {
        if (!groups.has(tool.group)) groups.set(tool.group, []);
        groups.get(tool.group).push(tool);
      });
    els.menu.innerHTML = Array.from(groups.entries()).map(([group, items]) => `
      <section class="menu-group">
        <h3>${tr(group)}</h3>
        ${items.map((tool) => `<button type="button" class="${tool.id === state.toolId ? "active" : ""}" data-tool="${tool.id}">${tr(tool.title)}</button>`).join("")}
      </section>
    `).join("");
  }

  function renderTool() {
    const tool = currentTool();
    if (tool.modes && !tool.modes.some((mode) => mode.id === state.mode)) state.mode = tool.modes[0].id;
    if (!tool.modes) state.mode = "default";
    els.group.textContent = tr(tool.group);
    els.title.textContent = tr(tool.title);
    els.desc.textContent = tr(tool.desc);
    els.form.innerHTML = tool.fields(state.mode).map(renderField).join("");
    els.mode.innerHTML = tool.modes ? tool.modes.map((mode) => `<button type="button" class="${mode.id === state.mode ? "active" : ""}" data-mode="${mode.id}">${tr(mode.label)}</button>`).join("") : "";
    els.form.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("input", calculate);
      input.addEventListener("change", calculate);
    });
    els.form.querySelectorAll("input").forEach((input) => input.select && input.addEventListener("focus", () => input.select()));
    els.formula.textContent = lang === "en" ? detailEn[tool.id].formula : tool.formula;
    els.boundary.textContent = lang === "en" ? detailEn[tool.id].boundary : tool.boundary;
    renderMenu(els.search.value);
    calculate();
  }

  function renderField(item) {
    const note = item.note ? `<small>${item.note}</small>` : "";
    if (item.type === "select") {
      return `<div class="field">
        <label for="${item.id}">${tr(item.label)}<span>${item.unit || ""}</span></label>
        <select id="${item.id}" name="${item.id}">${item.options.map((opt) => `<option value="${opt}" ${opt === item.value ? "selected" : ""}>${opt}</option>`).join("")}</select>
        ${item.note ? `<small>${tr(item.note)}</small>` : ""}
      </div>`;
    }
    return `<div class="field">
      <label for="${item.id}">${tr(item.label)}<span>${item.unit}</span></label>
      <input id="${item.id}" name="${item.id}" type="number" step="any" value="${item.value}" ${item.min !== null ? `min="${item.min}"` : ""}>
      ${item.note ? `<small>${tr(item.note)}</small>` : ""}
    </div>`;
  }

  function calculate() {
    const tool = currentTool();
    const values = {};
    tool.fields(state.mode).forEach((item) => { values[item.id] = val(item.id); });
    const result = tool.calc(values, state.mode);
    els.results.innerHTML = result.metrics.map((item) => `
      <article class="metric">
        <span>${tr(item.label)}</span>
        <strong>${format(item.value)}</strong>
        <small>${item.unit}</small>
      </article>
    `).join("");
    els.warnings.innerHTML = result.warnings.map(([type, text]) => `<div class="warning ${type}">${tr(text)}</div>`).join("");
    const danger = result.warnings.some(([type]) => type === "danger");
    const warn = result.warnings.length > 0;
    els.badge.className = `quality-badge ${danger ? "danger" : warn ? "warn" : ""}`;
    els.badge.textContent = danger ? t("danger") : warn ? t("warn") : t("usable");
  }

  function format(value) {
    if (!Number.isFinite(value)) return "-";
    const abs = Math.abs(value);
    if (abs !== 0 && (abs >= 100000 || abs < 0.001)) return value.toExponential(3);
    return nf.format(value);
  }

  function satPressure(t) {
    return 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
  }

  function dewPointFromPv(pv) {
    const ln = Math.log(Math.max(pv, 1e-9) / 0.61078);
    return 237.3 * ln / (17.27 - ln);
  }

  function frictionFactor(re, eps, d) {
    if (!Number.isFinite(re) || re <= 0) return 0;
    if (re < 2300) return 64 / re;
    const rel = Math.max(eps / Math.max(d, 1e-9), 1e-9);
    return 0.25 / Math.pow(Math.log10(rel / 3.7 + 5.74 / Math.pow(re, 0.9)), 2);
  }

  els.menu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (!button) return;
    state.toolId = button.dataset.tool;
    const tool = currentTool();
    state.mode = tool.modes ? tool.modes[0].id : "default";
    renderTool();
  });

  els.mode.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    state.mode = button.dataset.mode;
    renderTool();
  });

  els.search.addEventListener("input", () => renderMenu(els.search.value));
  els.print.addEventListener("click", () => window.print());
  els.langToggle.addEventListener("click", () => {
    lang = lang === "en" ? "zh" : "en";
    applyStaticI18n();
    renderTool();
  });

  applyStaticI18n();
  renderMenu();
  renderTool();
})();
