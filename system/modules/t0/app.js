const BRAND = "#001965";
const BLUE = "#0b42a0";
const CYAN = "#08a0b8";
const WARM = "#ffb703";
const RED = "#d9564a";
const GREEN = "#30a46c";
const LINE = "#d8dfec";
const MUTED = "#647084";

let lang = "en";
let activeTool = "coil";
let activeVizTab = "ntu";
let rafId = null;
const carnotPhaseVisible = { hotIso: true, adiabaticExpansion: true, coldIso: true, adiabaticCompression: true };
let carnotLegendHits = [];

const i18n = {
  zh: {
    appTitle: "暖通热工计算工具",
    branchLabel: "公司网站分支",
    inputs: "输入区域",
    exportPdf: "导出 PDF",
    formulaTitle: "公式和解读",
    report: {
      subtitle: "计算书",
      generatedAt: "生成时间",
      inputs: "输入参数",
      results: "计算结果",
      charts: "图表",
      formula: "公式与说明",
      printedAt: "打印时间"
    },
    toolNav: {
      coil: "冷冻水盘管与出风口模拟器",
      carnot: "卡诺循环模拟器",
      tower: "冷却塔模拟器（默克尔法）",
      dew: "露点温度和相对湿度计算工具",
      loss: "建筑散热模拟器",
      cop: "热泵和冷水机组能效比计算器",
      ahu: "AHU 热平衡模拟器"
    },
    tools: {
      coil: {
        title: "冷冻水盘管与出风口模拟器",
        desc: "基于显热 ε-NTU 简化模型，输入风量、冷冻水流量、空气入口温度、冷冻水入口温度和盘管 UA，计算热交换有效度、冷却能力、空气出口温度和出口逼近度。"
      },
      carnot: { title: "卡诺循环模拟器", desc: "模拟理想卡诺热机循环，根据高温热源温度、低温热源温度和吸收热量计算热效率、放热量、净输出功与熵变，并绘制 P-V 图和 T-S 图。" },
      tower: { title: "冷却塔模拟器（默克尔法）", desc: "实时计算逆流/横流冷却塔性能，输出 NTU、逼近度、冷却范围、有效性、补给水量和蒸发率，并用温度剖面、焓线图和 L/G 敏感性图辅助判断。" },
      dew: { title: "露点温度和相对湿度计算工具", desc: "基于马格努斯近似法，由干球温度、相对湿度和大气压计算露点、湿球温度、饱和水蒸气压、实际水蒸气压和空气含湿状态，并绘制 e-T 图。" },
      loss: { title: "建筑散热模拟器", desc: "根据墙体、窗、屋面面积及 U 值、室内外温差、建筑体积和换气次数，计算围护结构传热、通风渗透热损失、总热损失和热损失系数。" },
      cop: { title: "热泵和冷水机组能效比计算器", desc: "由制冷/制热量、输入功率、蒸发温度和冷凝温度计算实际 COP、EER、kW/RT，并同时给出制冷卡诺 COP、制热卡诺 COP 和实际性能占卡诺上限的比例。" },
      ahu: { title: "AHU 热平衡模拟器", desc: "按湿空气焓值和含湿量计算回风与新风混合状态、送风状态、盘管总负荷、显热负荷、潜热负荷和新风负荷。" }
    },
    fields: {
      airflowMin: "风量", waterFlowMin: "冷冻水流量", airInTemp: "空气入口温度", waterInTemp: "冷冻水入口温度", ua: "UA",
      hotTemp: "高温热源温度", coldTemp: "低温热源温度", heatInput: "吸收热量", towerType: "塔形式", waterFlow: "循环水量", hotWater: "进塔热水", coldWater: "出塔冷水", wetBulb: "室外湿球", airWaterRatio: "气水质量比",
      temp: "干球温度", rh: "相对湿度", pressure: "大气压", wallArea: "外墙面积", wallU: "外墙 U 值", windowArea: "窗面积", windowU: "窗 U 值",
      roofArea: "屋面面积", roofU: "屋面 U 值", indoor: "室内温度", outdoor: "室外温度", volume: "建筑体积", ach: "换气次数",
      capacity: "制冷/制热量", power: "输入功率", evapTemp: "蒸发温度", condTemp: "冷凝温度",
      airflow: "风量", returnDb: "回风干球", returnRh: "回风相对湿度", outdoorDb: "新风干球", outdoorRh: "新风相对湿度", freshAir: "新风比例", supplyDb: "送风干球", supplyRh: "送风相对湿度", fanHeat: "风机热增量"
    },
    metrics: {
      effectiveness: "热交换有效度", capacity: "冷却能力", airOut: "空气出口温度", approach: "出口逼近度",
      waterOut: "冷冻水出口温度", ntu: "NTU", cmin: "最小热容率", cmax: "最大热容率",
      efficiency: "热效率", heatIn: "吸热量", heatOut: "放热量", netWork: "净输出功", entropyChange: "熵变", copRef: "制冷 COP", copHp: "热泵 COP", lift: "温差",
      heatRejected: "散热量", towerApproach: "逼近度", coolingRange: "冷却范围", towerEff: "有效性", makeupWater: "补给水", evaporationRate: "蒸发率", merkel: "NTU",
      dewPoint: "露点", wetBulb: "湿球温度", satVaporPressure: "饱和水蒸气压", vaporPressure: "实际水蒸气压", absHumidity: "绝对湿度", humidityRatio: "混合比",
      heatLoss: "总热损失", heatLossCoeff: "热损失系数", envelope: "围护传热", ventilation: "通风渗透", wallLoss: "外墙热损失", windowLoss: "窗热损失", roofLoss: "屋面热损失", wattsM2: "单位面积负荷",
      cop: "实际 COP", eer: "EER", kwrt: "kW/RT", carnotPct: "制冷卡诺占比", carnotCooling: "制冷卡诺 COP", carnotHeating: "制热卡诺 COP", heatingCarnotPct: "制热卡诺占比", tempLift: "温升",
      mixDb: "混合干球", mixRh: "混合相对湿度", mixHumidity: "混合含湿量", coilLoad: "盘管总负荷", sensible: "显热负荷", latent: "潜热负荷", freshAirLoad: "新风负荷", supplyEnthalpy: "送风焓值", dryAirMass: "干空气质量流量"
    },
    tabs: {
      ntu: "ε-NTU 曲线",
      path: "空气温度路径",
      map: "风量-UA 负荷图",
      pvDiagram: "P-V 图",
      tsDiagram: "T-S 图",
      cycle: "循环示意图",
      performance: "性能曲线",
      comparison: "结果对比",
      towerRange: "温度曲线",
      towerMerkel: "焓图",
      towerBalance: "L/G敏感性分析",
      dewRh: "e-T 图",
      dewVapor: "水蒸气压力",
      dewState: "当前状态",
      lossBreakdown: "热损失分布",
      lossOutdoor: "室外温度敏感性",
      lossEnvelope: "部位传热系数",
      copLift: "温升-COP 曲线",
      copEnergy: "能效单位换算",
      copCarnot: "卡诺上限对比",
      ahuPsych: "湿空气路径",
      ahuLoads: "负荷分解",
      ahuFresh: "新风比例敏感性"
    },
    groups: {
      towerType: "塔形式",
      waterSide: "水侧参数",
      airSide: "空气侧参数",
      envelopeGroup: "围护结构参数",
      conditionGroup: "室内外条件",
      ventilationGroup: "通风渗透参数",
      airflowGroup: "风量与新风",
      returnAirGroup: "回风状态",
      outdoorAirGroup: "新风状态",
      supplyAirGroup: "送风与风机"
    },
    options: {
      counterflow: "逆流",
      crossflow: "横流"
    },
    formulas: {
      coil: "C_air = ρ·V_air·cp_air；C_water = ṁ_water·cp_water；C_min = min(C_air, C_water)；NTU = UA/C_min；ε = 1 - exp(-NTU)；Q = ε·C_min·(T_air,in - T_water,in)；T_air,out = T_air,in - Q/C_air。UA 的单位为 kW/K。这里采用显热中心的简易 ε-NTU 模型；若伴随除湿，需要进一步纳入盘管表面温度、露点和潜热负荷。",
      carnot: "η = 1 - Tc/Th；W = η·Qh；Qc = Qh - W = Qh·Tc/Th；ΔS = Qh/Th = Qc/Tc。T-S 图的矩形宽度为 ΔS，面积为净输出功 W。由于输入没有给出工质物质的量，P-V 图仅绘制归一化循环形状；内部用 r = exp(ΔS/R*) 生成示意比例，R* 为归一化常数，不表示实际气体常数或绝对体积。图中各阶段可在 P-V 图左键点击图例隐藏或显示。",
      tower: "冷却范围 R = Tw,in - Tw,out；逼近度 A = Tw,out - Twb；有效性 ε = R / (Tw,in - Twb)。Merkel 法：NTU = ∫[Tw,out→Tw,in] cpw dTw / (h′s(Tw) - ha(Tw))，其中 h′s(Tw) 是水温对应的饱和空气焓，ha(Tw) 按 L/G 与水温变化估算，本页用 4 点高斯积分近似。蒸发损失 E = mw × 0.002 × R；飞散损失 D = mw × 0.0002；排污损失 B = E/3；补给水 M = E + D + B；蒸发率 = E/mw。",
      dew: "马格努斯近似：es(T) = 0.61094·exp(17.625T/(T+243.04))；e = RH/100·es(T)；γ = ln(RH/100) + 17.625T/(243.04+T)；Td = 243.04γ/(17.625-γ)。绝对湿度 ρv = 2167e/(T+273.15)；混合比 w = 0.62198e/(P-e)。湿球温度由 e = es(Tw) - 0.00066(1+0.00115Tw)P(T-Tw) 迭代求解。e-T 图以温度为横轴、水蒸气压为纵轴，显示饱和曲线、20/40/60/80%RH 等值线、当前状态点和露点点。",
      loss: "室内外温差 ΔT = Tin - Tout。外墙、窗、屋面传热损失分别为 Qwall = Uwall·Awall·ΔT、Qwin = Uwin·Awin·ΔT、Qroof = Uroof·Aroof·ΔT；围护结构热损失 Qtrans = Σ(U·A·ΔT)。通风渗透热损失 Qvent = 0.33·ACH·V·ΔT，其中 0.33 为常用空气体积热容系数 W·h/(m³·K)。总热损失 Qtotal = Qtrans + Qvent；热损失系数 H = Qtotal/ΔT；单位面积负荷按 Qtotal/(Awall+Awin+Aroof) 估算。",
      cop: "实际 COP = Q/P。EER = COP × 3.412；kW/RT = 3.517/COP。温度必须换算为 K：Te = Tevap + 273.15，Tc = Tcond + 273.15，温升 Lift = Tc - Te。制冷卡诺 COPref = Te/(Tc-Te)；制热卡诺 COPhp = Tc/(Tc-Te)。制冷卡诺占比 = COP/COPref；制热卡诺占比 = COP/COPhp。若输入为冷水机组制冷量，重点看 COPref、kW/RT 和制冷卡诺占比；若输入为热泵制热量，重点看 COPhp 和制热卡诺占比。",
      ahu: "新风比 x 按干空气质量比例处理。回风、新风、送风焓值 h = 1.006T + w(2501 + 1.86T)，含湿量 w = 0.62198pv/(P-pv)。混合含湿量 wmix = x·woa + (1-x)·wra；混合焓 hmix = x·hoa + (1-x)·hra；混合干球由 hmix = 1.006Tmix + wmix(2501 + 1.86Tmix) 反算。盘管总负荷 Qcoil = mda·(hmix - hsupply) + Qfan；显热负荷 Qsen = mda·1.006·(Tmix - Tsupply)；潜热负荷 Qlat = Qcoil - Qfan - Qsen；新风负荷 Qoa = mda·x·(hoa - hra)。",
      default: "该工具采用常用暖通工程近似公式，结果用于方案阶段估算。精确设计仍需结合设备样本、当地标准、湿空气图或厂家选型软件校核。"
    },
    sections: {
      guide: {
        title: "阅读指引",
        items: [
          "先看热交换有效度 ε：越接近 1，说明盘管越接近理论最大换热。",
          "再看空气出口温度：它会随着 UA 增大、冷水温度降低或风量降低而下降。",
          "出口逼近度为空气出口温度与冷冻水入口温度之差，数值越小表示盘管越强，但通常意味着更大盘管或更高水量。"
        ]
      },
      usage: {
        title: "实际用法",
        items: [
          "用项目设计风量、预计冷冻水流量和厂家提供的 UA 做初算。",
          "通过风量-UA 负荷图观察盘管容量是否对风量过于敏感。",
          "如果空气出口温度低于室内露点，实际盘管会发生除湿，需转入湿空气盘管模型。"
        ]
      },
      knowledge: {
        title: "相关知识学习",
        items: [
          "ε-NTU 法适合在不知道出口温度时估算换热器性能。",
          "C_min 是空气侧和水侧中较小的热容率，理论最大换热量由它控制。",
          "UA 同时包含传热系数和换热面积，是盘管几何、材质、翅片、流速共同作用的综合指标。"
        ]
      },
      example: {
        title: "具体计算实例",
        items: [
          "默认输入下，风量 100 m³/min、水量 50 L/min、空气 30 °C、冷水 7 °C、UA 2.5 kW/K。",
          "模型会先把风量和水量换算为热容率，再计算 NTU 和 ε。",
          "右侧三个图表分别回答：盘管接近理论换热的程度、空气沿盘管降温路径、不同风量和 UA 组合下的容量变化。"
        ]
      },
      cautions: {
        title: "实践中的注意点",
        items: [
          "本页当前样板工具按干盘管显热过程处理，不替代含冷凝水的湿盘管选型。",
          "UA 在实际运行中会随风速、水速、污垢系数和结露状态变化。",
          "若出口逼近度异常小或空气出口温度接近冷水入口温度，需要检查 UA 或流量输入是否过大。"
        ]
      }
    }
  },
  en: {
    appTitle: "HVAC Thermal Engineering Tools",
    branchLabel: "Company website branch",
    inputs: "Inputs",
    exportPdf: "Export PDF",
    formulaTitle: "Formula and Interpretation",
    report: {
      subtitle: "Calculation Sheet",
      generatedAt: "Generated at",
      inputs: "Inputs",
      results: "Results",
      charts: "Charts",
      formula: "Formula and Notes",
      printedAt: "Printed at"
    },
    toolNav: {
      coil: "Chilled Water Coil and Outlet Simulator",
      carnot: "Carnot Cycle Simulator",
      tower: "Cooling Tower Simulator (Merkel Method)",
      dew: "Dew Point and RH Calculator",
      loss: "Building Heat Loss Simulator",
      cop: "Heat Pump and Chiller COP Calculator",
      ahu: "AHU Heat Balance Simulator"
    },
    tools: {
      coil: {
        title: "Chilled Water Coil and Outlet Simulator",
        desc: "A sensible ε-NTU model using airflow, chilled-water flow, entering air temperature, entering water temperature and coil UA to estimate effectiveness, cooling capacity, leaving air temperature and exit approach."
      },
      carnot: { title: "Carnot Cycle Simulator", desc: "Simulates an ideal Carnot heat-engine cycle from hot reservoir temperature, cold reservoir temperature and heat input, calculating efficiency, rejected heat, net work and entropy change with P-V and T-S diagrams." },
      tower: { title: "Cooling Tower Simulator (Merkel Method)", desc: "Calculates counterflow/crossflow cooling-tower performance: NTU, approach, cooling range, effectiveness, makeup water and evaporation rate, with temperature profile, enthalpy diagram and L/G sensitivity charts." },
      dew: { title: "Dew Point and RH Calculator", desc: "Uses the Magnus approximation to calculate dew point, wet-bulb temperature, saturated vapor pressure, actual vapor pressure and moisture state from dry-bulb temperature, relative humidity and atmospheric pressure, with an e-T diagram." },
      loss: { title: "Building Heat Loss Simulator", desc: "Calculates envelope transmission, ventilation/infiltration heat loss, total heat loss and heat-loss coefficient from wall/window/roof areas and U-values, indoor/outdoor temperature, volume and air-change rate." },
      cop: { title: "Heat Pump and Chiller COP Calculator", desc: "Calculates actual COP, EER and kW/RT from capacity, input power, evaporating temperature and condensing temperature, with both refrigeration and heating Carnot COP limits." },
      ahu: { title: "AHU Heat Balance Simulator", desc: "Calculates return/outdoor mixed-air state, supply-air state, total coil load, sensible load, latent load and outdoor-air load from psychrometric enthalpy and humidity ratio." }
    },
    fields: {
      airflowMin: "Airflow", waterFlowMin: "Chilled-water flow", airInTemp: "Entering air temperature", waterInTemp: "Entering water temperature", ua: "UA",
      hotTemp: "Hot reservoir temperature", coldTemp: "Cold reservoir temperature", heatInput: "Heat input", towerType: "Tower type", waterFlow: "Circulating water flow", hotWater: "Hot water in", coldWater: "Cold water out", wetBulb: "Outdoor wet bulb", airWaterRatio: "Air/water mass ratio",
      temp: "Dry bulb", rh: "Relative humidity", pressure: "Atmospheric pressure", wallArea: "Wall area", wallU: "Wall U-value", windowArea: "Window area", windowU: "Window U-value",
      roofArea: "Roof area", roofU: "Roof U-value", indoor: "Indoor temperature", outdoor: "Outdoor temperature", volume: "Building volume", ach: "Air changes",
      capacity: "Capacity", power: "Input power", evapTemp: "Evaporating temp.", condTemp: "Condensing temp.",
      airflow: "Airflow", returnDb: "Return dry bulb", returnRh: "Return RH", outdoorDb: "Outdoor dry bulb", outdoorRh: "Outdoor RH", freshAir: "Fresh air ratio", supplyDb: "Supply dry bulb", supplyRh: "Supply RH", fanHeat: "Fan heat gain"
    },
    metrics: {
      effectiveness: "Effectiveness", capacity: "Cooling capacity", airOut: "Leaving air temp.", approach: "Exit approach",
      waterOut: "Leaving water temp.", ntu: "NTU", cmin: "Cmin", cmax: "Cmax",
      efficiency: "Thermal efficiency", heatIn: "Heat input", heatOut: "Heat rejection", netWork: "Net work", entropyChange: "Entropy change", copRef: "Cooling COP", copHp: "Heating COP", lift: "Lift",
      heatRejected: "Heat rejection", towerApproach: "Approach", coolingRange: "Cooling range", towerEff: "Effectiveness", makeupWater: "Makeup water", evaporationRate: "Evaporation rate", merkel: "NTU",
      dewPoint: "Dew point", wetBulb: "Wet-bulb temperature", satVaporPressure: "Saturated vapor pressure", vaporPressure: "Actual vapor pressure", absHumidity: "Absolute humidity", humidityRatio: "Mixing ratio",
      heatLoss: "Total heat loss", heatLossCoeff: "Heat-loss coefficient", envelope: "Envelope transmission", ventilation: "Ventilation/infiltration", wallLoss: "Wall loss", windowLoss: "Window loss", roofLoss: "Roof loss", wattsM2: "Load per area",
      cop: "Actual COP", eer: "EER", kwrt: "kW/RT", carnotPct: "Cooling Carnot fraction", carnotCooling: "Cooling Carnot COP", carnotHeating: "Heating Carnot COP", heatingCarnotPct: "Heating Carnot fraction", tempLift: "Lift",
      mixDb: "Mixed dry bulb", mixRh: "Mixed RH", mixHumidity: "Mixed humidity ratio", coilLoad: "Total coil load", sensible: "Sensible load", latent: "Latent load", freshAirLoad: "Outdoor air load", supplyEnthalpy: "Supply enthalpy", dryAirMass: "Dry-air mass flow"
    },
    tabs: {
      ntu: "ε-NTU Curve",
      path: "Air Temperature Path",
      map: "Airflow-UA Load Map",
      pvDiagram: "P-V Diagram",
      tsDiagram: "T-S Diagram",
      cycle: "Cycle Diagram",
      performance: "Performance Curve",
      comparison: "Result Comparison",
      towerRange: "Temperature Curve",
      towerMerkel: "Enthalpy Chart",
      towerBalance: "L/G Sensitivity Analysis",
      dewRh: "e-T Diagram",
      dewVapor: "Vapor Pressure",
      dewState: "Current State",
      lossBreakdown: "Heat Loss Distribution",
      lossOutdoor: "Outdoor Sensitivity",
      lossEnvelope: "Envelope UA Comparison",
      copLift: "Lift-COP Curve",
      copEnergy: "Efficiency Unit Conversion",
      copCarnot: "Carnot Limit Comparison",
      ahuPsych: "Psychrometric Path",
      ahuLoads: "Load Breakdown",
      ahuFresh: "Fresh Air Sensitivity"
    },
    groups: {
      towerType: "Tower Type",
      waterSide: "Water-side Parameters",
      airSide: "Air-side Parameters",
      envelopeGroup: "Envelope Parameters",
      conditionGroup: "Indoor/Outdoor Conditions",
      ventilationGroup: "Ventilation/Infiltration Parameters",
      airflowGroup: "Airflow and Outdoor Air",
      returnAirGroup: "Return Air State",
      outdoorAirGroup: "Outdoor Air State",
      supplyAirGroup: "Supply Air and Fan"
    },
    options: {
      counterflow: "Counterflow",
      crossflow: "Crossflow"
    },
    formulas: {
      coil: "C_air = ρ·V_air·cp_air; C_water = ṁ_water·cp_water; C_min = min(C_air, C_water); NTU = UA/C_min; ε = 1 - exp(-NTU); Q = ε·C_min·(T_air,in - T_water,in); T_air,out = T_air,in - Q/C_air. UA is in kW/K. This is a sensible-centered ε-NTU approximation; condensation requires surface temperature, dew point and latent load analysis.",
      carnot: "η = 1 - Tc/Th; W = η·Qh; Qc = Qh - W = Qh·Tc/Th; ΔS = Qh/Th = Qc/Tc. The T-S rectangle width is ΔS and its area is net work W. Because the amount of working fluid is not an input, the P-V diagram is a normalized cycle shape only; r = exp(ΔS/R*) is used internally for visual proportion, where R* is a normalized constant, not the real gas constant or absolute volume scale. Click P-V legend items to hide or show stages.",
      tower: "Cooling range R = Tw,in - Tw,out; approach A = Tw,out - Twb; effectiveness ε = R / (Tw,in - Twb). Merkel method: NTU = ∫[Tw,out→Tw,in] cpw dTw / (h′s(Tw) - ha(Tw)), where h′s(Tw) is saturated air enthalpy at water temperature and ha(Tw) is estimated from L/G and water-temperature change; this page uses 4-point Gaussian quadrature. Evaporation loss E = mw × 0.002 × R; drift loss D = mw × 0.0002; blowdown loss B = E/3; makeup water M = E + D + B; evaporation rate = E/mw.",
      dew: "Magnus approximation: es(T) = 0.61094·exp(17.625T/(T+243.04)); e = RH/100·es(T); γ = ln(RH/100) + 17.625T/(243.04+T); Td = 243.04γ/(17.625-γ). Absolute humidity ρv = 2167e/(T+273.15); mixing ratio w = 0.62198e/(P-e). Wet-bulb temperature is solved from e = es(Tw) - 0.00066(1+0.00115Tw)P(T-Tw). The e-T diagram plots temperature versus vapor pressure, including the saturation curve, 20/40/60/80%RH curves, current state and dew-point state.",
      loss: "Temperature difference ΔT = Tin - Tout. Wall, window and roof transmission losses are Qwall = Uwall·Awall·ΔT, Qwin = Uwin·Awin·ΔT and Qroof = Uroof·Aroof·ΔT; envelope transmission Qtrans = Σ(U·A·ΔT). Ventilation/infiltration heat loss Qvent = 0.33·ACH·V·ΔT, where 0.33 is the common volumetric heat-capacity coefficient of air in W·h/(m³·K). Total heat loss Qtotal = Qtrans + Qvent; heat-loss coefficient H = Qtotal/ΔT; load per area is estimated as Qtotal/(Awall+Awin+Aroof).",
      cop: "Actual COP = Q/P. EER = COP × 3.412; kW/RT = 3.517/COP. Temperatures must be converted to K: Te = Tevap + 273.15, Tc = Tcond + 273.15 and Lift = Tc - Te. Refrigeration Carnot COPref = Te/(Tc-Te); heating Carnot COPhp = Tc/(Tc-Te). Cooling Carnot fraction = COP/COPref; heating Carnot fraction = COP/COPhp. For chillers, focus on COPref, kW/RT and cooling Carnot fraction; for heat pumps, focus on COPhp and heating Carnot fraction.",
      ahu: "Outdoor-air ratio x is treated as a dry-air mass fraction. Enthalpy h = 1.006T + w(2501 + 1.86T), and humidity ratio w = 0.62198pv/(P-pv). Mixed humidity ratio wmix = x·woa + (1-x)·wra; mixed enthalpy hmix = x·hoa + (1-x)·hra; mixed dry bulb is solved from hmix = 1.006Tmix + wmix(2501 + 1.86Tmix). Total coil load Qcoil = mda·(hmix - hsupply) + Qfan; sensible load Qsen = mda·1.006·(Tmix - Tsupply); latent load Qlat = Qcoil - Qfan - Qsen; outdoor-air load Qoa = mda·x·(hoa - hra).",
      default: "These tools use common HVAC engineering approximations for early design estimates. Final design should be checked with standards, psychrometric analysis and manufacturer selection software."
    },
    sections: {
      guide: { title: "Reading Guide", items: ["Start with effectiveness ε: values closer to 1 mean the coil approaches its theoretical maximum heat transfer.", "Leaving air temperature falls when UA increases, chilled-water temperature decreases or airflow decreases.", "Exit approach is the difference between leaving air temperature and entering water temperature. A smaller value means a stronger coil but normally requires more surface or water flow."] },
      usage: { title: "Practical Use", items: ["Use design airflow, expected water flow and manufacturer UA for a first pass.", "Use the airflow-UA map to see whether capacity is too sensitive to airflow.", "If leaving air temperature falls below the room dew point, switch to a wet-coil psychrometric model."] },
      knowledge: { title: "Related Learning", items: ["The ε-NTU method is useful when outlet temperatures are unknown.", "Cmin is the smaller heat-capacity rate and limits theoretical maximum heat transfer.", "UA combines heat-transfer coefficient and area and depends on geometry, fins, materials and flow rates."] },
      example: { title: "Calculation Example", items: ["The default case uses 100 m³/min airflow, 50 L/min water flow, 30 °C entering air, 7 °C entering water and 2.5 kW/K UA.", "The model converts airflow and water flow into heat-capacity rates, then calculates NTU and ε.", "The three charts answer how close the coil is to ideal heat transfer, how air cools through the coil and how load changes with airflow and UA."] },
      cautions: { title: "Practical Cautions", items: ["This sample tool treats the process as sensible dry-coil cooling and does not replace wet-coil selection.", "Actual UA varies with air velocity, water velocity, fouling and condensate conditions.", "If the approach becomes unrealistically small, check whether UA or flow inputs are too large."] }
    }
  }
};

const toolFields = {
  coil: [
    ["airflowMin", 100, "m³/min", 1, 800],
    ["waterFlowMin", 50, "L/min", 1, 600],
    ["airInTemp", 30, "°C", -10, 60],
    ["waterInTemp", 7, "°C", -5, 30],
    ["ua", 2.5, "kW/K", 0.01, 30]
  ],
  carnot: [["hotTemp", 500, "K", 1, 2000], ["coldTemp", 300, "K", 1, 1999], ["heatInput", 3000, "J", 1, 1000000]],
  tower: [
    { key: "towerType", value: "counterflow", unit: "", type: "select", group: "towerType", options: ["counterflow", "crossflow"] },
    { key: "waterFlow", value: 20, unit: "kg/s", group: "waterSide", min: 0.1, max: 10000 },
    { key: "hotWater", value: 37, unit: "°C", group: "waterSide", min: 0, max: 100 },
    { key: "coldWater", value: 30, unit: "°C", group: "waterSide", min: 0, max: 100 },
    { key: "wetBulb", value: 25, unit: "°C", group: "airSide", min: -20, max: 60 },
    { key: "airWaterRatio", value: 1.25, unit: "kg/kg", group: "airSide", min: 0.1, max: 10 }
  ],
  dew: [["temp", 26, "°C", -40, 80], ["rh", 60, "%", 1, 100], ["pressure", 101.325, "kPa", 80, 110]],
  loss: [
    { key: "wallArea", value: 260, unit: "m²", group: "envelopeGroup", min: 0, max: 100000 },
    { key: "wallU", value: 0.45, unit: "W/m²K", group: "envelopeGroup", min: 0, max: 10 },
    { key: "windowArea", value: 70, unit: "m²", group: "envelopeGroup", min: 0, max: 100000 },
    { key: "windowU", value: 2.2, unit: "W/m²K", group: "envelopeGroup", min: 0, max: 10 },
    { key: "roofArea", value: 180, unit: "m²", group: "envelopeGroup", min: 0, max: 100000 },
    { key: "roofU", value: 0.35, unit: "W/m²K", group: "envelopeGroup", min: 0, max: 10 },
    { key: "indoor", value: 20, unit: "°C", group: "conditionGroup", min: -50, max: 80 },
    { key: "outdoor", value: -5, unit: "°C", group: "conditionGroup", min: -80, max: 60 },
    { key: "volume", value: 1200, unit: "m³", group: "ventilationGroup", min: 0, max: 1000000 },
    { key: "ach", value: 0.7, unit: "1/h", group: "ventilationGroup", min: 0, max: 20 }
  ],
  cop: [["capacity", 350, "kW"], ["power", 78, "kW"], ["evapTemp", 5, "°C"], ["condTemp", 40, "°C"]],
  ahu: [
    { key: "airflow", value: 6000, unit: "m³/h", group: "airflowGroup", min: 1, max: 1000000 },
    { key: "freshAir", value: 30, unit: "%", group: "airflowGroup", min: 0, max: 100 },
    { key: "returnDb", value: 24, unit: "°C", group: "returnAirGroup", min: -40, max: 80 },
    { key: "returnRh", value: 50, unit: "%", group: "returnAirGroup", min: 1, max: 100 },
    { key: "outdoorDb", value: 34, unit: "°C", group: "outdoorAirGroup", min: -40, max: 80 },
    { key: "outdoorRh", value: 65, unit: "%", group: "outdoorAirGroup", min: 1, max: 100 },
    { key: "supplyDb", value: 14, unit: "°C", group: "supplyAirGroup", min: -40, max: 80 },
    { key: "supplyRh", value: 90, unit: "%", group: "supplyAirGroup", min: 1, max: 100 },
    { key: "fanHeat", value: 1.2, unit: "kW", group: "supplyAirGroup", min: 0, max: 10000 }
  ]
};

const values = Object.fromEntries(
  Object.entries(toolFields).map(([tool, fields]) => [tool, Object.fromEntries(fields.map((field) => {
    const normalized = Array.isArray(field) ? { key: field[0], value: field[1] } : field;
    return [normalized.key, normalized.value];
  }))])
);

const tabsByTool = {
  coil: ["ntu", "path", "map"],
  carnot: ["pvDiagram", "tsDiagram", "comparison"],
  tower: ["towerRange", "towerMerkel", "towerBalance"],
  dew: ["dewRh", "dewVapor", "dewState"],
  loss: ["lossBreakdown", "lossOutdoor", "lossEnvelope"],
  cop: ["copLift", "copEnergy", "copCarnot"],
  ahu: ["ahuPsych", "ahuLoads", "ahuFresh"]
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number(n) || 0));
}

function fmt(n, digits = 1) {
  return Number.isFinite(n) ? Number(n).toFixed(digits) : "0.0";
}

function metric(label, value, unit = "") {
  return `<div class="metric"><strong>${value}</strong><span>${label}${unit ? ` · ${unit}` : ""}</span></div>`;
}

function satPressure(T) {
  return 0.61094 * Math.exp((17.625 * T) / (T + 243.04));
}

function humidityRatio(T, rh) {
  const pv = satPressure(T) * clamp(rh, 1, 100) / 100;
  return 0.62198 * pv / (101.325 - pv);
}

function enthalpy(T, rh) {
  const w = humidityRatio(T, rh);
  return 1.006 * T + w * (2501 + 1.86 * T);
}

function dewPoint(T, rh) {
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(clamp(rh, 1, 100) / 100) + (a * T) / (b + T);
  return (b * gamma) / (a - gamma);
}

function humidityRatioAtPressure(T, rh, pressure = 101.325) {
  const pv = satPressure(T) * clamp(rh, 1, 100) / 100;
  return 0.62198 * pv / Math.max(0.001, pressure - pv);
}

function wetBulbTemperature(T, rh, pressure = 101.325) {
  const pv = satPressure(T) * clamp(rh, 1, 100) / 100;
  let lo = Math.min(dewPoint(T, rh), T);
  let hi = Math.max(dewPoint(T, rh), T);
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    const psychPv = satPressure(mid) - 0.00066 * (1 + 0.00115 * mid) * pressure * (T - mid);
    if (psychPv > pv) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function dewStateModel(v) {
  const temp = Number(v.temp) || 0;
  const rh = clamp(v.rh, 1, 100);
  const pressure = clamp(v.pressure || 101.325, 20, 200);
  const sat = satPressure(temp);
  const pv = sat * rh / 100;
  const dp = dewPoint(temp, rh);
  const wb = wetBulbTemperature(temp, rh, pressure);
  const abs = 2167 * pv / (temp + 273.15);
  const w = humidityRatioAtPressure(temp, rh, pressure) * 1000;
  return { temp, rh, pressure, sat, pv, dp, wb, abs, w };
}

function buildingHeatLossModel(v, outdoorOverride) {
  const indoor = Number(v.indoor) || 0;
  const outdoor = outdoorOverride === undefined ? Number(v.outdoor) || 0 : outdoorOverride;
  const dt = Math.max(0, indoor - outdoor);
  const wallUA = Math.max(0, v.wallArea * v.wallU);
  const windowUA = Math.max(0, v.windowArea * v.windowU);
  const roofUA = Math.max(0, v.roofArea * v.roofU);
  const ventilationUA = Math.max(0, 0.33 * v.ach * v.volume);
  const wall = wallUA * dt / 1000;
  const window = windowUA * dt / 1000;
  const roof = roofUA * dt / 1000;
  const ventilation = ventilationUA * dt / 1000;
  const envelope = wall + window + roof;
  const total = envelope + ventilation;
  const heatLossCoeff = wallUA + windowUA + roofUA + ventilationUA;
  const envelopeArea = Math.max(1, v.wallArea + v.windowArea + v.roofArea);
  const loadPerArea = total * 1000 / envelopeArea;
  return { indoor, outdoor, dt, wallUA, windowUA, roofUA, ventilationUA, wall, window, roof, envelope, ventilation, total, heatLossCoeff, loadPerArea };
}

function copModel(v, liftOverride) {
  const capacity = Math.max(0, Number(v.capacity) || 0);
  const power = Math.max(0.0001, Number(v.power) || 0.0001);
  const evapK = Math.max(1, (Number(v.evapTemp) || 0) + 273.15);
  const rawCondK = Math.max(1, (Number(v.condTemp) || 0) + 273.15);
  const lift = Math.max(0.1, liftOverride === undefined ? rawCondK - evapK : liftOverride);
  const condK = evapK + lift;
  const cop = capacity / power;
  const eer = cop * 3.412;
  const kwrt = 3.517 / Math.max(0.0001, cop);
  const carnotCooling = evapK / lift;
  const carnotHeating = condK / lift;
  const coolingCarnotPct = cop / carnotCooling * 100;
  const heatingCarnotPct = cop / carnotHeating * 100;
  return { capacity, power, evapK, condK, lift, cop, eer, kwrt, carnotCooling, carnotHeating, coolingCarnotPct, heatingCarnotPct };
}

function moistAirState(T, rh, pressure = 101.325) {
  const pv = satPressure(T) * clamp(rh, 1, 100) / 100;
  const w = 0.62198 * pv / Math.max(0.001, pressure - pv);
  const h = 1.006 * T + w * (2501 + 1.86 * T);
  return { db: T, rh: clamp(rh, 1, 100), pv, w, h };
}

function dryBulbFromHW(h, w) {
  return (h - 2501 * w) / Math.max(0.001, 1.006 + 1.86 * w);
}

function rhFromTW(T, w, pressure = 101.325) {
  const pv = pressure * w / Math.max(0.001, 0.62198 + w);
  return clamp(pv / satPressure(T) * 100, 0, 100);
}

function ahuModel(v, freshAirOverride) {
  const x = clamp(freshAirOverride === undefined ? v.freshAir : freshAirOverride, 0, 100) / 100;
  const ret = moistAirState(v.returnDb, v.returnRh);
  const out = moistAirState(v.outdoorDb, v.outdoorRh);
  const sup = moistAirState(v.supplyDb, v.supplyRh);
  const mixW = x * out.w + (1 - x) * ret.w;
  const mixH = x * out.h + (1 - x) * ret.h;
  const mixDb = dryBulbFromHW(mixH, mixW);
  const mixRh = rhFromTW(mixDb, mixW);
  const mix = { db: mixDb, rh: mixRh, w: mixW, h: mixH };
  const mda = airMassDry(v.airflow, mixDb, mixRh);
  const rawCoil = mda * (mixH - sup.h);
  const coolingCoil = Math.max(0, rawCoil) + Math.max(0, v.fanHeat);
  const sensible = Math.max(0, mda * 1.006 * (mixDb - v.supplyDb));
  const latent = Math.max(0, rawCoil - sensible);
  const freshAirLoad = Math.max(0, mda * x * (out.h - ret.h));
  return { x, ret, out, sup, mix, mda, rawCoil, coolingCoil, sensible, latent, freshAirLoad, fanHeat: Math.max(0, v.fanHeat) };
}

function airMassDry(flowM3h, T, rh) {
  const w = humidityRatio(T, rh);
  const moistDensity = 101325 / (287.05 * (T + 273.15)) * (1 - 0.378 * satPressure(T) * rh / 100 / 101.325);
  return flowM3h / 3600 * moistDensity / (1 + w);
}

function buildNav() {
  const nav = document.getElementById("toolNav");
  nav.innerHTML = "";
  Object.keys(toolFields).forEach((id) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `nav-button ${id === activeTool ? "active" : ""}`;
    btn.textContent = i18n[lang].toolNav[id];
    btn.addEventListener("click", () => {
      activeTool = id;
      activeVizTab = tabsByTool[id]?.[0] || "default";
      render();
    });
    nav.appendChild(btn);
  });
}

function buildInputs() {
  const panel = document.getElementById("inputPanel");
  panel.innerHTML = `<p class="eyebrow" style="color: var(--brand)">${i18n[lang].inputs}</p>`;
  let currentGroup = "";
  toolFields[activeTool].forEach((field) => {
    const normalized = Array.isArray(field)
      ? { key: field[0], value: field[1], unit: field[2], min: field[3], max: field[4], type: "number" }
      : { type: "number", ...field };
    const { key, unit, min, max, type, group, options = [] } = normalized;
    if (group && group !== currentGroup) {
      currentGroup = group;
      const heading = document.createElement("h3");
      heading.className = "input-group-title";
      heading.textContent = i18n[lang].groups[group] || group;
      panel.appendChild(heading);
    }
    const wrap = document.createElement("div");
    wrap.className = "field";
    const control = type === "select"
      ? `<select id="${key}">${options.map((option) => `<option value="${option}" ${values[activeTool][key] === option ? "selected" : ""}>${i18n[lang].options[option] || option}</option>`).join("")}</select>`
      : `<input id="${key}" type="number" step="any" value="${values[activeTool][key]}" ${min !== undefined ? `min="${min}"` : ""} ${max !== undefined ? `max="${max}"` : ""} />`;
    wrap.innerHTML = `
      <label for="${key}">${i18n[lang].fields[key]} <span>${unit || ""}</span></label>
      ${control}
    `;
    wrap.querySelector(type === "select" ? "select" : "input").addEventListener("input", (event) => {
      values[activeTool][key] = type === "select" ? event.target.value : Number(event.target.value);
      updateResults();
    });
    panel.appendChild(wrap);
  });
}

function buildTabs() {
  const tabbar = document.getElementById("vizTabs");
  const tabs = tabsByTool[activeTool] || [];
  tabbar.innerHTML = "";
  tabbar.style.display = tabs.length ? "flex" : "none";
  tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tab-button ${tab === activeVizTab ? "active" : ""}`;
    btn.textContent = i18n[lang].tabs[tab];
    btn.addEventListener("click", () => {
      activeVizTab = tab;
      buildTabs();
      updateResults();
    });
    tabbar.appendChild(btn);
  });
}

function render() {
  const dict = i18n[lang];
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = dict.appTitle;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = dict[el.dataset.i18n];
  });
  document.getElementById("toolTitle").textContent = dict.tools[activeTool].title;
  document.getElementById("toolDescription").textContent = dict.tools[activeTool].desc;
  document.getElementById("formulaTitle").textContent = dict.formulaTitle;
  buildNav();
  buildInputs();
  buildTabs();
  updateResults();
}

function updateResults() {
  const result = calculators[activeTool](values[activeTool]);
  const animationCanvas = document.getElementById("animationCanvas");
  document.getElementById("metrics").innerHTML = result.metrics.join("");
  document.getElementById("formula").textContent = result.formula || i18n[lang].formulas.default;
  renderContentSections(result.sections);
  drawMain(result.chart);
  if (result.animation) {
    animationCanvas.style.display = "block";
    startAnimation(result.animation);
  } else {
    cancelAnimationFrame(rafId);
    animationCanvas.style.display = "none";
  }
}

function renderContentSections(sections) {
  const host = document.getElementById("contentSections");
  if (!sections) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = Object.values(sections).map((section) => `
    <article class="info-block">
      <h3>${section.title}</h3>
      <ul>${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function makeSections(tool) {
  const dict = i18n[lang];
  const name = dict.tools[tool].title;
  if (lang === "zh") {
    if (tool === "tower") {
      return {
        guide: {
          title: "阅读指引",
          items: [
            "先看 NTU：它表示冷却塔完成指定水温降所需的传质能力，数值越大，代表塔体填料、风量或接触效率要求越高。",
            "逼近度是出塔冷水温度与室外湿球温度的差值；逼近度越小，越接近理论冷却极限，通常设备尺寸和能耗要求也越高。",
            "温度曲线用于查看水温沿塔高变化，焓图用于查看空气焓与饱和空气焓之间的驱动力，L/G 敏感性用于判断气水比变化对 NTU 的影响。"
          ]
        },
        usage: {
          title: "实际用法",
          items: [
            "选择逆流或横流塔形式后，输入循环水量、进塔热水、出塔冷水、室外湿球温度和气水质量比。",
            "用 NTU 和逼近度判断当前工况是否偏紧；若逼近度过小，应检查出塔水温目标是否过低。",
            "用补给水和蒸发率估算运行耗水量，作为水处理、补水管径和排污控制的前期依据。"
          ]
        },
        knowledge: {
          title: "相关知识学习",
          items: [
            "Merkel 法把冷却塔内的显热和潜热交换合并到空气焓差中，用焓差驱动力积分描述塔的传热传质能力。",
            "冷却范围 Range = 进塔热水温度 - 出塔冷水温度；有效性 ε = Range / (进塔热水温度 - 湿球温度)。",
            "L/G 为气水质量比，增大 L/G 往往提高空气侧带走热量的能力，但实际还受风机功耗、填料性能和漂水控制影响。"
          ]
        },
        example: {
          title: "具体计算实例",
          items: [
            "默认工况为逆流塔、循环水量 20 kg/s、进塔热水 37 °C、出塔冷水 30 °C、湿球温度 25 °C、L/G = 1.25。",
            "该工况下冷却范围为 7 °C，逼近度为 5 °C，有效性约为 58.3%。",
            "补给水由蒸发损失、飞散损失和排污损失组成；默认估算用于方案比较，不代替水处理专业计算。"
          ]
        },
        cautions: {
          title: "实践中的注意点",
          items: [
            "本工具为简化 Merkel 法估算，未显式考虑填料特性曲线、风机曲线、海拔修正和漂水器效率。",
            "当出塔冷水温度低于或非常接近湿球温度时，模型会进入不合理区域，应重新检查输入。",
            "补给水估算中的飞散和排污比例为经验值，实际项目应按设备样本、水质浓缩倍数和当地规范调整。"
          ]
        }
      };
    }
    if (tool === "dew") {
      return {
        guide: {
          title: "阅读指引",
          items: [
            "先看露点温度：当空气被冷却到该温度时，相对湿度达到 100%，继续降温会开始结露。",
            "再看实际水蒸气压 e 与饱和水蒸气压 es：相对湿度就是 e/es 的百分比，e-T 图中的当前状态点应落在对应 RH 曲线上。",
            "湿球温度位于干球温度和露点温度之间，常用于蒸发冷却、冷却塔和新风处理工况判断。"
          ]
        },
        usage: {
          title: "实际用法",
          items: [
            "输入干球温度、相对湿度和现场大气压；普通海平面工况可使用默认 101.325 kPa。",
            "用露点判断风管、表冷器、冷冻水管或围护结构表面是否存在结露风险。",
            "切换 e-T 图、水蒸气压力和当前状态，核对温湿度变化对露点、湿球温度、混合比和绝对湿度的影响。"
          ]
        },
        knowledge: {
          title: "相关知识学习",
          items: [
            "马格努斯近似用温度快速估算饱和水蒸气压，在常见暖通温湿度范围内精度较好。",
            "绝对湿度表示单位体积湿空气中的水蒸气质量，混合比表示每 kg 干空气对应的水蒸气质量。",
            "大气压不改变露点和水蒸气分压力的基本关系，但会影响混合比和湿球温度的计算。"
          ]
        },
        example: {
          title: "具体计算实例",
          items: [
            "默认 26 °C、60%RH、101.325 kPa 工况下，露点约 17.6 °C，湿球温度约 20.1 °C。",
            "该状态的饱和水蒸气压约 3.36 kPa，实际水蒸气压约 2.02 kPa，绝对湿度约 14.6 g/m³。",
            "在 e-T 图中，当前点位于 60%RH 曲线附近，沿等水蒸气压水平线向左与饱和曲线相交的位置就是露点。"
          ]
        },
        cautions: {
          title: "实践中的注意点",
          items: [
            "马格努斯公式是工程近似，极低温、高温或高压特殊工况应采用更完整的湿空气性质模型校核。",
            "相对湿度传感器误差会显著影响露点，接近结露边界时应考虑测量误差和安全裕量。",
            "用于设备选型时，应结合当地海拔气压、室内外设计状态点和湿空气图复核。"
          ]
        }
      };
    }
    if (tool === "loss") {
      return {
        guide: {
          title: "阅读指引",
          items: [
            "先看总热损失：它表示当前室内外温差下建筑需要补偿的设计热量，单位为 kW。",
            "再看热损失分布：外墙、窗、屋面和通风渗透四项相加应等于总热损失。",
            "室外温度敏感性图用于观察室外设计温度变化时，总热损失、围护结构传热和通风渗透热损失的变化趋势。"
          ]
        },
        usage: {
          title: "实际用法",
          items: [
            "输入墙体、窗和屋面的面积及 U 值，再输入室内设计温度、室外设计温度、建筑体积和换气次数。",
            "用热损失系数 W/K 快速判断建筑保温水平；同一建筑下，热损失会随室内外温差近似线性变化。",
            "用部位传热系数图找出主要薄弱项，通常窗的 U 值较高，但最终影响还取决于面积。"
          ]
        },
        knowledge: {
          title: "相关知识学习",
          items: [
            "U 值表示单位面积、单位温差下的传热能力，U 值越小，保温性能越好。",
            "通风渗透热损失用 0.33·ACH·V·ΔT 估算，其中 ACH 是每小时换气次数，V 是建筑体积。",
            "热损失系数 H = ΣUA + 0.33·ACH·V，表示每 1 K 温差带来的热损失，适合比较不同方案。"
          ]
        },
        example: {
          title: "具体计算实例",
          items: [
            "默认工况：外墙 260 m²、U=0.45，窗 70 m²、U=2.2，屋面 180 m²、U=0.35，室内 20 °C、室外 -5 °C。",
            "围护结构传热约 8.35 kW，通风渗透约 6.93 kW，总热损失约 15.28 kW。",
            "热损失系数约 611 W/K；当室外温度升高、室内外温差减小时，总热损失按同一系数下降。"
          ]
        },
        cautions: {
          title: "实践中的注意点",
          items: [
            "本页为稳态热损失估算，未考虑热桥、太阳辐射、内部得热、间歇运行和蓄热效应。",
            "U 值应来自围护结构构造计算、规范限值或材料样本；窗还需注意框、玻璃和安装热桥。",
            "换气次数对结果影响很大，正式设计应结合气密性、机械通风量和当地规范取值。"
          ]
        }
      };
    }
    if (tool === "cop") {
      return {
        guide: {
          title: "阅读指引",
          items: [
            "先看实际 COP：它等于制冷/制热量除以输入功率，表示每 1 kW 电功率产生多少 kW 冷量或热量。",
            "再看制冷卡诺 COP 和制热卡诺 COP：两者分别对应冷水机组制冷模式和热泵制热模式的理论上限。",
            "温升-COP 曲线用于观察蒸发温度与冷凝温度差值变大时，理论上限和实际 COP 的相对位置。"
          ]
        },
        usage: {
          title: "实际用法",
          items: [
            "输入设备标称制冷量或制热量、输入功率、蒸发温度和冷凝温度；温度用于估算卡诺上限。",
            "冷水机组场景重点查看 COP、EER、kW/RT 和制冷卡诺占比；kW/RT 越低，单位冷吨耗电越少。",
            "热泵场景重点查看 COP 与制热卡诺 COP 的差距；温升越大，理论 COP 和实际 COP 通常越低。"
          ]
        },
        knowledge: {
          title: "相关知识学习",
          items: [
            "EER = COP × 3.412，常用于北美制冷设备能效表达。",
            "kW/RT = 3.517/COP，常用于冷水机组单位冷吨耗电表达。",
            "卡诺 COP 只由绝对温度决定，制冷为 Te/(Tc-Te)，制热为 Tc/(Tc-Te)，实际设备必然低于卡诺上限。"
          ]
        },
        example: {
          title: "具体计算实例",
          items: [
            "默认 350 kW 容量、78 kW 输入功率时，实际 COP = 4.49，EER ≈ 15.3，kW/RT ≈ 0.78。",
            "蒸发温度 5 °C、冷凝温度 40 °C 时，制冷卡诺 COP ≈ 7.95，制热卡诺 COP ≈ 8.95。",
            "该默认工况下，实际 COP 约为制冷卡诺上限的 56.5%，可作为方案阶段能效水平参考。"
          ]
        },
        cautions: {
          title: "实践中的注意点",
          items: [
            "蒸发温度和冷凝温度应使用制冷循环侧温度，不应简单等同于冷冻水出水或冷却水出水温度。",
            "输入功率应明确是否包含压缩机、风机、水泵和辅助功率，不同口径会影响 COP。",
            "部分负荷、变频控制、除霜、融霜和泵风机配置会改变季节能效，不能只用单点 COP 判断全年能耗。"
          ]
        }
      };
    }
    if (tool === "ahu") {
      return {
        guide: {
          title: "阅读指引",
          items: [
            "先看湿空气路径：R 为回风，O 为新风，M 为混合风，S 为送风；M 点应位于 R-O 连线上。",
            "再看盘管总负荷：它由混合风状态降到送风状态所需的焓差决定，并叠加风机热增量。",
            "负荷分解图用于区分显热、潜热、新风负荷和风机热，判断盘管处理过程是以降温为主还是除湿为主。"
          ]
        },
        usage: {
          title: "实际用法",
          items: [
            "输入总送风量、新风比例、回风状态、新风状态、送风状态和风机热增量。",
            "用混合干球、混合相对湿度和混合含湿量核对混风箱工况，再用盘管总负荷估算冷却盘管容量。",
            "通过新风比例敏感性图观察新风量变化对盘管负荷、新风负荷和潜热负荷的影响。"
          ]
        },
        knowledge: {
          title: "相关知识学习",
          items: [
            "AHU 热平衡应按焓值和含湿量混合，而不是简单线性混合相对湿度。",
            "总负荷按干空气质量流量乘以混合风与送风焓差计算；显热按干空气质量流量、空气定压比热和干球温差计算。",
            "潜热为总焓差负荷扣除显热后的部分，主要对应除湿或加湿过程。"
          ]
        },
        example: {
          title: "具体计算实例",
          items: [
            "默认工况：6000 m³/h，总新风 30%，回风 24 °C/50%RH，新风 34 °C/65%RH，送风 14 °C/90%RH。",
            "按焓值和含湿量混合后，混合干球约 27.0 °C，混合相对湿度约 58.5%，混合含湿量约 13.1 g/kg。",
            "默认盘管总负荷约 47.1 kW，其中显热约 25.2 kW，潜热约 20.7 kW，新风负荷约 24.6 kW，可用于方案阶段容量估算。"
          ]
        },
        cautions: {
          title: "实践中的注意点",
          items: [
            "本页默认按 101.325 kPa 标准大气压估算，海拔较高时应修正湿空气性质和干空气质量流量。",
            "风机热增量应根据风机位置判断加在盘管前还是盘管后；本工具按盘管负荷附加项显示。",
            "正式 AHU 选型还需校核盘管旁通因子、表冷器表面温度、冷凝水量、再热和控制策略。"
          ]
        }
      };
    }
    return {
      guide: { title: "阅读指引", items: [`先查看 ${name} 的核心结果，再切换右侧图表观察输入变化带来的趋势。`, "图表中的曲线、柱状图或状态点都由当前输入实时计算生成。", "若某个结果接近工程边界值，应优先检查输入单位和适用范围。"] },
      usage: { title: "实际用法", items: ["用于方案阶段快速比较不同输入条件。", "可导出 PDF 计算书，保留当前输入、结果、公式和全部右侧图表。", "正式设计需结合厂家样本、标准规范或专业选型软件复核。"] },
      knowledge: { title: "相关知识学习", items: ["该模块采用常见暖通热工近似公式，强调趋势判断和量级校核。", "曲线图适合观察敏感性，柱状图适合比较结果构成。", "热湿过程涉及空气焓、含湿量或温差时，应注意单位一致性。"] },
      example: { title: "具体计算实例", items: ["保留默认值时可作为基准工况。", "调整单个输入后观察结果卡片与图表同步变化。", "将不同工况导出为 PDF，便于方案汇总和内部讨论。"] },
      cautions: { title: "实践中的注意点", items: ["近似模型不应替代最终设备选型。", "输入超出常见工程范围时，图表只反映公式外推，不代表真实设备性能。", "如果图表趋势和工程直觉冲突，应先复查边界条件、单位和假设。"] }
    };
  }
  if (tool === "tower") {
    return {
      guide: { title: "Reading Guide", items: ["Start with NTU: it represents the transfer capability required to achieve the specified water cooling duty.", "Approach is the difference between leaving cold-water temperature and outdoor wet-bulb temperature; a smaller approach is closer to the theoretical limit.", "Use the temperature curve, enthalpy chart and L/G sensitivity chart to inspect water cooling, enthalpy driving force and air-water ratio sensitivity."] },
      usage: { title: "Practical Use", items: ["Select counterflow or crossflow, then enter circulating water flow, hot-water inlet, cold-water outlet, wet-bulb temperature and L/G ratio.", "Use NTU and approach to judge whether the cooling target is too aggressive.", "Use makeup water and evaporation rate as early estimates for water consumption, makeup piping and blowdown planning."] },
      knowledge: { title: "Related Learning", items: ["Merkel method combines sensible and latent exchange into an air-enthalpy driving force.", "Cooling range is hot-water inlet minus cold-water outlet; effectiveness is range divided by hot-water inlet minus wet-bulb temperature.", "L/G is the air-to-water mass ratio; increasing it can improve heat rejection but affects fan power and drift control."] },
      example: { title: "Calculation Example", items: ["Default case: counterflow tower, 20 kg/s water flow, 37 °C hot water, 30 °C cold water, 25 °C wet bulb and L/G = 1.25.", "The default range is 7 °C, approach is 5 °C and effectiveness is about 58.3%.", "Makeup water combines evaporation, drift and blowdown losses; the estimate is for comparison, not final water-treatment design."] },
      cautions: { title: "Practical Cautions", items: ["This is a simplified Merkel estimate and does not include fill characteristic curves, fan curves, altitude correction or drift eliminator efficiency.", "If leaving cold-water temperature is below or nearly equal to wet-bulb temperature, review the inputs.", "Drift and blowdown factors are empirical and should be adjusted using manufacturer data, concentration cycles and local codes."] }
    };
  }
  if (tool === "dew") {
    return {
      guide: { title: "Reading Guide", items: ["Start with dew point: when air is cooled to this temperature, relative humidity reaches 100% and condensation begins.", "Compare actual vapor pressure e with saturated vapor pressure es; relative humidity is e/es, and the current point should lie on the matching RH curve in the e-T diagram.", "Wet-bulb temperature lies between dry-bulb and dew-point temperatures and is useful for evaporative cooling, cooling towers and outdoor-air processes."] },
      usage: { title: "Practical Use", items: ["Enter dry-bulb temperature, relative humidity and site atmospheric pressure. Use 101.325 kPa for a standard sea-level case.", "Use dew point to judge condensation risk on ducts, coils, chilled-water pipes and envelope surfaces.", "Switch between the e-T diagram, vapor-pressure chart and current-state view to inspect how humidity changes affect dew point, wet bulb, mixing ratio and absolute humidity."] },
      knowledge: { title: "Related Learning", items: ["The Magnus approximation estimates saturated vapor pressure quickly and is accurate enough for common HVAC temperature and humidity ranges.", "Absolute humidity is water-vapor mass per volume of moist air; mixing ratio is water-vapor mass per kg of dry air.", "Atmospheric pressure does not change the basic dew-point and vapor-pressure relation, but it affects mixing ratio and wet-bulb temperature."] },
      example: { title: "Calculation Example", items: ["At the default 26 °C, 60%RH and 101.325 kPa, dew point is about 17.6 °C and wet-bulb temperature is about 20.1 °C.", "Saturated vapor pressure is about 3.36 kPa, actual vapor pressure is about 2.02 kPa and absolute humidity is about 14.6 g/m³.", "In the e-T diagram, the current point lies near the 60%RH curve; moving left along the same vapor-pressure line to the saturation curve gives the dew point."] },
      cautions: { title: "Practical Cautions", items: ["Magnus is an engineering approximation; unusual low-temperature, high-temperature or high-pressure cases should be checked with a full psychrometric property model.", "Relative-humidity sensor error strongly affects dew point, so include measurement tolerance near condensation boundaries.", "For equipment selection, check local altitude pressure, indoor/outdoor design states and a psychrometric chart."] }
    };
  }
  if (tool === "loss") {
    return {
      guide: { title: "Reading Guide", items: ["Start with total heat loss: it is the heating load required to offset the current indoor-outdoor temperature difference.", "Then check the distribution: wall, window, roof and ventilation/infiltration losses should add up to total heat loss.", "Use outdoor sensitivity to see how total, envelope and ventilation losses change as the outdoor design temperature changes."] },
      usage: { title: "Practical Use", items: ["Enter wall, window and roof areas and U-values, then indoor design temperature, outdoor design temperature, building volume and air changes per hour.", "Use heat-loss coefficient in W/K to compare envelope quality; for the same building, heat loss changes almost linearly with temperature difference.", "Use envelope UA comparison to identify weak components. Windows often have higher U-values, but impact also depends on area."] },
      knowledge: { title: "Related Learning", items: ["U-value is heat transfer per area per temperature difference; lower U-values mean better insulation.", "Ventilation/infiltration loss is estimated with 0.33·ACH·V·ΔT, where ACH is air changes per hour and V is building volume.", "Heat-loss coefficient H = ΣUA + 0.33·ACH·V gives the loss per 1 K temperature difference and is useful for comparing options."] },
      example: { title: "Calculation Example", items: ["Default case: wall 260 m² at U=0.45, window 70 m² at U=2.2, roof 180 m² at U=0.35, indoor 20 °C and outdoor -5 °C.", "Envelope transmission is about 8.35 kW, ventilation/infiltration is about 6.93 kW and total heat loss is about 15.28 kW.", "The heat-loss coefficient is about 611 W/K; if outdoor temperature rises and ΔT falls, total heat loss decreases by the same coefficient."] },
      cautions: { title: "Practical Cautions", items: ["This is a steady-state heat-loss estimate and does not include thermal bridges, solar gains, internal gains, intermittent operation or thermal storage.", "U-values should come from envelope assembly calculations, code limits or manufacturer data. For windows, include frame, glass and installation effects.", "Air-change rate has a strong impact; final design should use airtightness, mechanical ventilation flow and local code requirements."] }
    };
  }
  if (tool === "cop") {
    return {
      guide: { title: "Reading Guide", items: ["Start with actual COP: it equals cooling/heating capacity divided by input power.", "Then compare cooling Carnot COP and heating Carnot COP, which are theoretical limits for chiller refrigeration mode and heat-pump heating mode.", "Use the lift-COP curve to see how increasing temperature lift lowers theoretical limits and where the actual COP sits."] },
      usage: { title: "Practical Use", items: ["Enter nominal cooling or heating capacity, input power, evaporating temperature and condensing temperature. Temperatures are used to estimate Carnot limits.", "For chillers, focus on COP, EER, kW/RT and cooling Carnot fraction. Lower kW/RT means less power per refrigeration ton.", "For heat pumps, focus on COP versus heating Carnot COP. Higher lift usually lowers both theoretical and actual COP."] },
      knowledge: { title: "Related Learning", items: ["EER = COP × 3.412 and is common in North American cooling equipment ratings.", "kW/RT = 3.517/COP and is common for chiller power per refrigeration ton.", "Carnot COP depends only on absolute temperatures: Te/(Tc-Te) for refrigeration and Tc/(Tc-Te) for heating. Real equipment is always below the Carnot limit."] },
      example: { title: "Calculation Example", items: ["At 350 kW capacity and 78 kW input power, actual COP is 4.49, EER is about 15.3 and kW/RT is about 0.78.", "With 5 °C evaporating and 40 °C condensing temperatures, cooling Carnot COP is about 7.95 and heating Carnot COP is about 8.95.", "The default actual COP is about 56.5% of the cooling Carnot limit, useful as an early efficiency benchmark."] },
      cautions: { title: "Practical Cautions", items: ["Evaporating and condensing temperatures should be refrigerant-cycle temperatures, not simply chilled-water or condenser-water leaving temperatures.", "Clarify whether input power includes compressor only or also fans, pumps and auxiliaries.", "Part-load operation, variable-speed control, defrost and pump/fan configuration affect seasonal efficiency, so a single-point COP is not an annual energy prediction."] }
    };
  }
  if (tool === "ahu") {
    return {
      guide: { title: "Reading Guide", items: ["Start with the psychrometric path: R is return air, O is outdoor air, M is mixed air and S is supply air. M should sit on the R-O mixing line.", "Then check total coil load, which is driven by the enthalpy drop from mixed air to supply air plus fan heat gain.", "Use load breakdown to distinguish sensible, latent, outdoor-air and fan heat components."] },
      usage: { title: "Practical Use", items: ["Enter total airflow, outdoor-air ratio, return-air state, outdoor-air state, supply-air state and fan heat gain.", "Use mixed dry bulb, mixed RH and mixed humidity ratio to verify the mixing-box state, then use total coil load for coil sizing.", "Use outdoor-air ratio sensitivity to see how fresh-air percentage changes coil load, outdoor-air load and latent load."] },
      knowledge: { title: "Related Learning", items: ["AHU heat balance should mix enthalpy and humidity ratio, not relative humidity directly.", "Total load is dry-air mass flow times the enthalpy difference; sensible load is dry-air mass flow times air specific heat and dry-bulb difference.", "Latent load is the remaining part of the total enthalpy load after sensible load, corresponding mainly to dehumidification or humidification."] },
      example: { title: "Calculation Example", items: ["Default case: 6000 m³/h airflow, 30% outdoor air, return air 24 °C/50%RH, outdoor air 34 °C/65%RH and supply air 14 °C/90%RH.", "After mixing by enthalpy and humidity ratio, mixed dry bulb is about 27.0 °C, mixed RH about 58.5% and mixed humidity ratio about 13.1 g/kg.", "Default total coil load is about 47.1 kW, with about 25.2 kW sensible, 20.7 kW latent and 24.6 kW outdoor-air load, suitable for early capacity checks."] },
      cautions: { title: "Practical Cautions", items: ["This page assumes 101.325 kPa standard atmospheric pressure; high-altitude projects should correct psychrometric properties and dry-air mass flow.", "Fan heat should be assigned before or after the coil depending on fan location. This tool displays it as an added coil-load item.", "Final AHU selection should also check coil bypass factor, apparatus dew point, condensate flow, reheat and control sequence."] }
    };
  }
  return {
    guide: { title: "Reading Guide", items: [`Start with the key ${name} results, then use the right-side charts to inspect trends.`, "Curves, bars and state points are recalculated from current inputs.", "When a result approaches a boundary, check units and applicability first."] },
    usage: { title: "Practical Use", items: ["Use this for early-stage comparison of design conditions.", "Export a PDF calculation sheet with current inputs, results, formulas and all charts.", "Final design should be checked with standards, manufacturer data or selection software."] },
    knowledge: { title: "Related Learning", items: ["The module uses common HVAC approximations for trend and magnitude checks.", "Line charts show sensitivity; bar charts compare result composition.", "For heat and moisture processes, keep enthalpy, humidity ratio and temperature units consistent."] },
    example: { title: "Calculation Example", items: ["Default values act as a baseline case.", "Change one input and watch result cards and charts update together.", "Export different cases as PDFs for internal comparison."] },
    cautions: { title: "Practical Cautions", items: ["Approximate models do not replace final equipment selection.", "Inputs outside common engineering ranges are formula extrapolations.", "If a trend conflicts with engineering intuition, review boundary conditions, units and assumptions."] }
  };
}

function coolingTowerModel(v) {
  const cpw = 4.186;
  const hot = Math.max(v.hotWater, v.coldWater);
  const cold = Math.min(v.hotWater, v.coldWater);
  const range = Math.max(0, hot - cold);
  const approach = cold - v.wetBulb;
  const lg = Math.max(0.1, Number(v.airWaterRatio) || 0.1);
  const airInH = enthalpy(v.wetBulb, 100);
  const correction = v.towerType === "crossflow" ? 1 / 0.92 : 1;
  const gaussX = [-0.861136, -0.339981, 0.339981, 0.861136];
  const gaussW = [0.347855, 0.652145, 0.652145, 0.347855];
  let integral = 0;
  gaussX.forEach((x, i) => {
    const temp = (hot + cold) / 2 + (range / 2) * x;
    const airH = airInH + lg * cpw * (temp - cold);
    const drive = Math.max(0.2, enthalpy(temp, 100) - airH);
    integral += gaussW[i] * cpw / drive;
  });
  const ntu = Math.max(0, integral * range / 2 * correction);
  const effectiveness = range / Math.max(0.1, hot - v.wetBulb);
  const evaporationLoss = Math.max(0, v.waterFlow * 0.002 * range);
  const driftLoss = Math.max(0, v.waterFlow * 0.0002);
  const blowdownLoss = evaporationLoss / 3;
  const makeupWater = evaporationLoss + driftLoss + blowdownLoss;
  const evaporationRate = evaporationLoss / Math.max(0.1, v.waterFlow);
  const labels = ["0", "25", "50", "75", "100"];
  const water = labels.map((_, i) => hot - range * i / (labels.length - 1));
  const airEnthalpy = water.map((temp) => airInH + lg * cpw * (temp - cold));
  const saturatedEnthalpy = water.map((temp) => enthalpy(temp, 100));
  const airEquivalent = airEnthalpy.map((h) => {
    let bestT = v.wetBulb;
    let bestErr = Infinity;
    for (let t = -10; t <= 60; t += 0.5) {
      const err = Math.abs(enthalpy(t, 100) - h);
      if (err < bestErr) {
        bestErr = err;
        bestT = t;
      }
    }
    return bestT;
  });
  return {
    ntu,
    range,
    approach,
    effectiveness,
    evaporationLoss,
    makeupWater,
    evaporationRate,
    profile: { labels, water, airEquivalent, airEnthalpy, saturatedEnthalpy }
  };
}

const calculators = {
  coil(v) {
    const airDensity = 1.2;
    const cpAir = 1.006;
    const cpWater = 4.186;
    const airVolume = Math.max(0.1, v.airflowMin) / 60;
    const waterMass = Math.max(0.1, v.waterFlowMin) / 60;
    const cAir = airDensity * airVolume * cpAir;
    const cWater = waterMass * cpWater;
    const cMin = Math.max(0.001, Math.min(cAir, cWater));
    const cMax = Math.max(cAir, cWater);
    const ntu = Math.max(0, v.ua / cMin);
    const effectiveness = 1 - Math.exp(-ntu);
    const deltaT = Math.max(0, v.airInTemp - v.waterInTemp);
    const capacity = effectiveness * cMin * deltaT;
    const airOut = v.airInTemp - capacity / Math.max(0.001, cAir);
    const waterOut = v.waterInTemp + capacity / Math.max(0.001, cWater);
    const approach = airOut - v.waterInTemp;
    const model = { ...v, airDensity, cpAir, cpWater, cAir, cWater, cMin, cMax, ntu, effectiveness, capacity, airOut, waterOut, approach };

    return {
      metrics: [
        metric(i18n[lang].metrics.effectiveness, fmt(effectiveness * 100), "%"),
        metric(i18n[lang].metrics.capacity, fmt(capacity), "kW"),
        metric(i18n[lang].metrics.airOut, fmt(airOut), "°C"),
        metric(i18n[lang].metrics.approach, fmt(approach), "K")
      ],
      chart: { type: `coil-${activeVizTab}`, model },
      formula: i18n[lang].formulas.coil,
      sections: i18n[lang].sections
    };
  },
  carnot(v) {
    const th = Math.max(Number(v.hotTemp) || 1, (Number(v.coldTemp) || 1) + 1);
    const tc = Math.max(1, Math.min(Number(v.coldTemp) || 1, th - 1));
    const gamma = 1.4;
    const lift = Math.max(1, th - tc);
    const efficiency = Math.max(0, 1 - tc / th);
    const heatIn = Math.max(0, Number(v.heatInput) || 0);
    const entropyDelta = heatIn / th;
    const visualR = Math.max(1, entropyDelta / Math.log(2));
    const r = Math.max(1.01, Math.exp(entropyDelta / visualR));
    const heatOut = heatIn * tc / th;
    const netWork = heatIn - heatOut;
    const adiabaticRatio = Math.pow(th / tc, 1 / (gamma - 1));
    const points = {
      v1: 1,
      v2: r,
      v3: r * adiabaticRatio,
      v4: adiabaticRatio
    };
    const model = { th, tc, r, visualR, gamma, efficiency, heatIn, heatOut, netWork, entropyDelta, adiabaticRatio, points };
    const chart = activeVizTab === "pvDiagram"
      ? { type: "carnot-pv", model }
      : activeVizTab === "tsDiagram"
        ? { type: "carnot-ts", model }
        : { type: "bars", title: i18n[lang].tabs.comparison, labels: [i18n[lang].metrics.efficiency, i18n[lang].metrics.netWork, i18n[lang].metrics.heatOut, i18n[lang].metrics.entropyChange], values: [efficiency * 100, netWork, heatOut, entropyDelta], colors: [GREEN, WARM, CYAN, BLUE], unit: "% / J / J/K" };
    return {
      metrics: [
        metric(i18n[lang].metrics.efficiency, fmt(efficiency * 100), "%"),
        metric(i18n[lang].metrics.netWork, fmt(netWork, 0), "J"),
        metric(i18n[lang].metrics.heatOut, fmt(heatOut, 0), "J"),
        metric(i18n[lang].metrics.entropyChange, fmt(entropyDelta, 2), "J/K")
      ],
      chart,
      formula: i18n[lang].formulas.carnot,
      sections: makeSections("carnot")
    };
  },
  tower(v) {
    const model = coolingTowerModel(v);
    const towerName = i18n[lang].options[v.towerType] || v.towerType;
    const chart = activeVizTab === "towerRange"
      ? {
        type: "lines",
        title: `${i18n[lang].tabs.towerRange} · ${towerName}`,
        labels: model.profile.labels,
        series: [
          { values: model.profile.water, color: BLUE },
          { values: model.profile.airEquivalent, color: CYAN }
        ],
        unit: "°C"
      }
      : activeVizTab === "towerMerkel"
        ? {
          type: "lines",
          title: `${i18n[lang].tabs.towerMerkel} · ${towerName}`,
          labels: model.profile.labels,
          series: [
            { values: model.profile.saturatedEnthalpy, color: BLUE },
            { values: model.profile.airEnthalpy, color: CYAN }
          ],
          unit: "kJ/kg dry air"
        }
        : {
          type: "lines",
          title: `${i18n[lang].tabs.towerBalance} · ${towerName}`,
          labels: ["0.6", "0.8", "1.0", "1.2", "1.4", "1.6"],
          series: [{ values: [0.6, 0.8, 1, 1.2, 1.4, 1.6].map((lg) => coolingTowerModel({ ...v, airWaterRatio: lg }).ntu), color: BLUE }],
          unit: "NTU"
        };
    return {
      metrics: [
        metric(i18n[lang].metrics.merkel, fmt(model.ntu, 2)),
        metric(i18n[lang].metrics.towerApproach, fmt(model.approach), "°C"),
        metric(i18n[lang].metrics.coolingRange, fmt(model.range), "°C"),
        metric(i18n[lang].metrics.towerEff, fmt(model.effectiveness * 100), "%"),
        metric(i18n[lang].metrics.makeupWater, fmt(model.makeupWater, 3), "kg/s"),
        metric(i18n[lang].metrics.evaporationRate, fmt(model.evaporationRate * 100), "%")
      ],
      chart,
      formula: i18n[lang].formulas.tower,
      sections: makeSections("tower")
    };
  },
  dew(v) {
    const model = dewStateModel(v);
    const temps = [-20, -10, 0, 10, 20, 30, 40, 50];
    const chart = activeVizTab === "dewRh"
      ? { type: "dew-et", model }
      : activeVizTab === "dewVapor"
        ? {
          type: "lines",
          title: i18n[lang].tabs.dewVapor,
          labels: temps.map(String),
          series: [
            { values: temps.map((temp) => satPressure(temp)), color: BLUE },
            { values: temps.map((temp) => satPressure(temp) * model.rh / 100), color: CYAN }
          ],
          unit: "kPa"
        }
        : {
          type: "bars",
          title: i18n[lang].tabs.dewState,
          labels: [i18n[lang].metrics.dewPoint, i18n[lang].metrics.wetBulb, i18n[lang].metrics.vaporPressure, i18n[lang].metrics.humidityRatio],
          values: [model.dp, model.wb, model.pv, model.w],
          colors: [BLUE, CYAN, WARM, GREEN],
          unit: ""
        };
    return {
      metrics: [
        metric(i18n[lang].metrics.dewPoint, fmt(model.dp), "°C"),
        metric(i18n[lang].metrics.wetBulb, fmt(model.wb), "°C"),
        metric(i18n[lang].metrics.satVaporPressure, fmt(model.sat, 2), "kPa"),
        metric(i18n[lang].metrics.vaporPressure, fmt(model.pv, 2), "kPa"),
        metric(i18n[lang].metrics.absHumidity, fmt(model.abs, 1), "g/m³"),
        metric(i18n[lang].metrics.humidityRatio, fmt(model.w, 1), "g/kg")
      ],
      chart,
      formula: i18n[lang].formulas.dew,
      sections: makeSections("dew")
    };
  },
  loss(v) {
    const model = buildingHeatLossModel(v);
    const step = Math.max(5, Math.round(Math.max(1, model.dt) / 2 / 5) * 5);
    const outs = [v.outdoor - step * 2, v.outdoor - step, v.outdoor, v.outdoor + step, v.outdoor + step * 2, v.indoor].map((value) => Math.min(v.indoor, value));
    const chart = activeVizTab === "lossBreakdown"
      ? { type: "bars", title: i18n[lang].tabs.lossBreakdown, labels: [i18n[lang].metrics.wallLoss, i18n[lang].metrics.windowLoss, i18n[lang].metrics.roofLoss, i18n[lang].metrics.ventilation], values: [model.wall, model.window, model.roof, model.ventilation], colors: [BLUE, CYAN, WARM, RED], unit: "kW" }
      : activeVizTab === "lossOutdoor"
        ? {
          type: "lines",
          title: i18n[lang].tabs.lossOutdoor,
          labels: outs.map((out) => fmt(out, 0)),
          series: [
            { label: i18n[lang].metrics.heatLoss, values: outs.map((out) => buildingHeatLossModel(v, out).total), color: BLUE },
            { label: i18n[lang].metrics.envelope, values: outs.map((out) => buildingHeatLossModel(v, out).envelope), color: CYAN },
            { label: i18n[lang].metrics.ventilation, values: outs.map((out) => buildingHeatLossModel(v, out).ventilation), color: RED }
          ],
          unit: "kW"
        }
        : { type: "bars", title: i18n[lang].tabs.lossEnvelope, labels: [i18n[lang].fields.wallArea, i18n[lang].fields.windowArea, i18n[lang].fields.roofArea, i18n[lang].metrics.ventilation], values: [model.wallUA, model.windowUA, model.roofUA, model.ventilationUA], colors: [BLUE, CYAN, WARM, RED], unit: "W/K" };
    return {
      metrics: [
        metric(i18n[lang].metrics.heatLoss, fmt(model.total), "kW"),
        metric(i18n[lang].metrics.heatLossCoeff, fmt(model.heatLossCoeff, 0), "W/K"),
        metric(i18n[lang].metrics.envelope, fmt(model.envelope), "kW"),
        metric(i18n[lang].metrics.ventilation, fmt(model.ventilation), "kW"),
        metric(i18n[lang].metrics.windowLoss, fmt(model.window), "kW"),
        metric(i18n[lang].metrics.wattsM2, fmt(model.loadPerArea), "W/m²")
      ],
      chart,
      formula: i18n[lang].formulas.loss,
      sections: makeSections("loss")
    };
  },
  cop(v) {
    const model = copModel(v);
    const baseLift = Math.max(5, Math.round(model.lift / 5) * 5);
    const lifts = [baseLift - 15, baseLift - 10, baseLift - 5, baseLift, baseLift + 5, baseLift + 10, baseLift + 15].map((lift) => Math.max(1, lift));
    const chart = activeVizTab === "copLift"
      ? {
        type: "lines",
        title: i18n[lang].tabs.copLift,
        labels: lifts.map((lift) => fmt(lift, 0)),
        series: [
          { label: i18n[lang].metrics.carnotCooling, values: lifts.map((lift) => copModel(v, lift).carnotCooling), color: BLUE },
          { label: i18n[lang].metrics.carnotHeating, values: lifts.map((lift) => copModel(v, lift).carnotHeating), color: CYAN },
          { label: i18n[lang].metrics.cop, values: lifts.map(() => model.cop), color: RED }
        ],
        unit: "COP"
      }
      : activeVizTab === "copEnergy"
        ? { type: "bars", title: i18n[lang].tabs.copEnergy, labels: [i18n[lang].metrics.cop, i18n[lang].metrics.eer, i18n[lang].metrics.kwrt], values: [model.cop, model.eer, model.kwrt], colors: [BLUE, CYAN, WARM], unit: "" }
        : { type: "bars", title: i18n[lang].tabs.copCarnot, labels: [i18n[lang].metrics.cop, i18n[lang].metrics.carnotCooling, i18n[lang].metrics.carnotHeating, i18n[lang].metrics.carnotPct, i18n[lang].metrics.heatingCarnotPct], values: [model.cop, model.carnotCooling, model.carnotHeating, model.coolingCarnotPct, model.heatingCarnotPct], colors: [BLUE, CYAN, GREEN, WARM, RED], unit: "" };
    return {
      metrics: [
        metric(i18n[lang].metrics.cop, fmt(model.cop, 2)),
        metric(i18n[lang].metrics.eer, fmt(model.eer, 1), "Btu/Wh"),
        metric(i18n[lang].metrics.kwrt, fmt(model.kwrt, 2)),
        metric(i18n[lang].metrics.carnotCooling, fmt(model.carnotCooling, 2)),
        metric(i18n[lang].metrics.carnotHeating, fmt(model.carnotHeating, 2)),
        metric(i18n[lang].metrics.carnotPct, fmt(model.coolingCarnotPct), "%")
      ],
      chart,
      formula: i18n[lang].formulas.cop,
      sections: makeSections("cop")
    };
  },
  ahu(v) {
    const model = ahuModel(v);
    const psych = { type: "psych", title: i18n[lang].tabs.ahuPsych, points: [
      { name: "R", x: model.ret.db, y: model.ret.w * 1000, color: BLUE },
      { name: "O", x: model.out.db, y: model.out.w * 1000, color: RED },
      { name: "M", x: model.mix.db, y: model.mix.w * 1000, color: WARM },
      { name: "S", x: model.sup.db, y: model.sup.w * 1000, color: GREEN }
    ] };
    const chart = activeVizTab === "ahuPsych"
      ? psych
      : activeVizTab === "ahuLoads"
        ? { type: "bars", title: i18n[lang].tabs.ahuLoads, labels: [i18n[lang].metrics.coilLoad, i18n[lang].metrics.sensible, i18n[lang].metrics.latent, i18n[lang].metrics.freshAirLoad, i18n[lang].fields.fanHeat], values: [model.coolingCoil, model.sensible, model.latent, model.freshAirLoad, model.fanHeat], colors: [BLUE, CYAN, WARM, GREEN, RED], unit: "kW" }
        : {
          type: "lines",
          title: i18n[lang].tabs.ahuFresh,
          labels: ["0", "20", "40", "60", "80", "100"],
          series: [
            { label: i18n[lang].metrics.coilLoad, values: [0, 20, 40, 60, 80, 100].map((fa) => ahuModel(v, fa).coolingCoil), color: BLUE },
            { label: i18n[lang].metrics.freshAirLoad, values: [0, 20, 40, 60, 80, 100].map((fa) => ahuModel(v, fa).freshAirLoad), color: WARM },
            { label: i18n[lang].metrics.latent, values: [0, 20, 40, 60, 80, 100].map((fa) => ahuModel(v, fa).latent), color: CYAN }
          ],
          unit: "kW"
        };
    return {
      metrics: [
        metric(i18n[lang].metrics.mixDb, fmt(model.mix.db), "°C"),
        metric(i18n[lang].metrics.mixRh, fmt(model.mix.rh), "%"),
        metric(i18n[lang].metrics.mixHumidity, fmt(model.mix.w * 1000, 1), "g/kg"),
        metric(i18n[lang].metrics.coilLoad, fmt(model.coolingCoil), "kW"),
        metric(i18n[lang].metrics.sensible, fmt(model.sensible), "kW"),
        metric(i18n[lang].metrics.latent, fmt(model.latent), "kW")
      ],
      chart,
      formula: i18n[lang].formulas.ahu,
      sections: makeSections("ahu")
    };
  }
};

function drawMain(chart) {
  const canvas = document.getElementById("mainChart");
  drawChartToCanvas(canvas, chart);
}

function drawChartToCanvas(canvas, chart) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  if (chart.type === "coil-ntu") drawCoilNtu(ctx, chart.model, w, h);
  if (chart.type === "coil-path") drawCoilPath(ctx, chart.model, w, h);
  if (chart.type === "coil-map") drawCoilMap(ctx, chart.model, w, h);
  if (chart.type === "carnot-pv") drawCarnotPV(ctx, chart.model, w, h);
  if (chart.type === "carnot-ts") drawCarnotTS(ctx, chart.model, w, h);
  if (chart.type === "bars") drawBars(ctx, chart, w, h);
  if (chart.type === "lines") drawLines(ctx, chart, w, h);
  if (chart.type === "dew-et") drawDewET(ctx, chart.model, w, h);
  if (chart.type === "cycle") drawCycle(ctx, chart, w, h);
  if (chart.type === "psych") drawPsych(ctx, chart, w, h);
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const y = 52 + i * ((h - 110) / 5);
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.lineTo(w - 34, y);
    ctx.stroke();
  }
}

function title(ctx, text, sub = "") {
  ctx.fillStyle = BRAND;
  ctx.font = "700 20px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.fillText(text, 64, 32);
  if (sub) {
    ctx.fillStyle = MUTED;
    ctx.font = "12px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText(sub, 64, 52);
  }
}

function drawCoilNtu(ctx, m, w, h) {
  title(ctx, i18n[lang].tabs.ntu, `NTU ${fmt(m.ntu, 2)} · ε ${fmt(m.effectiveness * 100)}%`);
  const left = 74, right = w - 44, top = 70, bottom = h - 54;
  const xScale = (x) => left + (x / 5) * (right - left);
  const yScale = (y) => bottom - y * (bottom - top);
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const ntu = i / 20;
    const eff = 1 - Math.exp(-ntu);
    if (i === 0) ctx.moveTo(xScale(ntu), yScale(eff));
    else ctx.lineTo(xScale(ntu), yScale(eff));
  }
  ctx.stroke();
  const px = xScale(Math.min(5, m.ntu));
  const py = yScale(m.effectiveness);
  ctx.fillStyle = WARM;
  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BRAND;
  ctx.font = "700 14px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.fillText(`Q ${fmt(m.capacity)} kW`, px + 12, py - 10);
  axisLabel(ctx, "NTU", w / 2 - 16, h - 20);
  axisLabel(ctx, "ε", 38, 78);
}

function drawCoilPath(ctx, m, w, h) {
  title(ctx, i18n[lang].tabs.path, `${fmt(m.airInTemp)}°C → ${fmt(m.airOut)}°C`);
  const left = 90, right = w - 90, cy = h / 2;
  const maxT = Math.max(m.airInTemp, m.waterOut) + 4;
  const minT = Math.min(m.waterInTemp, m.airOut) - 4;
  const y = (temp) => cy + 95 - ((temp - minT) / Math.max(1, maxT - minT)) * 190;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.strokeRect(left, cy - 56, right - left, 112);
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(left + 36, y(m.airInTemp));
  ctx.bezierCurveTo(w / 2 - 100, y(m.airInTemp), w / 2 + 100, y(m.airOut), right - 36, y(m.airOut));
  ctx.stroke();
  ctx.strokeStyle = CYAN;
  ctx.beginPath();
  ctx.moveTo(right - 36, y(m.waterInTemp));
  ctx.bezierCurveTo(w / 2 + 100, y(m.waterInTemp), w / 2 - 100, y(m.waterOut), left + 36, y(m.waterOut));
  ctx.stroke();
  pointLabel(ctx, left + 36, y(m.airInTemp), BLUE, `${fmt(m.airInTemp)}°C`);
  pointLabel(ctx, right - 36, y(m.airOut), BLUE, `${fmt(m.airOut)}°C`);
  pointLabel(ctx, right - 36, y(m.waterInTemp), CYAN, `${fmt(m.waterInTemp)}°C`);
  pointLabel(ctx, left + 36, y(m.waterOut), CYAN, `${fmt(m.waterOut)}°C`);
}

function drawCoilMap(ctx, m, w, h) {
  title(ctx, i18n[lang].tabs.map, `Q ${fmt(m.capacity)} kW · UA ${fmt(m.ua, 2)} kW/K`);
  const left = 78, right = w - 40, top = 70, bottom = h - 58;
  const cols = 120;
  const rows = 72;
  const flowMin = Math.max(1, m.airflowMin * 0.35);
  const flowMax = Math.max(flowMin + 1, m.airflowMin * 1.65);
  const uaMin = Math.max(0.01, m.ua * 0.25);
  const uaMax = Math.max(uaMin + 0.01, m.ua * 1.85);
  const sample = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const flow = flowMin + (flowMax - flowMin) * c / (cols - 1);
      const ua = uaMin + (uaMax - uaMin) * r / (rows - 1);
      sample.push(coilCapacity({ ...m, airflowMin: flow, ua }).capacity);
    }
  }
  const max = Math.max(...sample, 1);
  const cellW = (right - left) / cols;
  const cellH = (bottom - top) / rows;
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = heatColor(sample[i++] / max);
      ctx.fillRect(left + c * cellW, bottom - (r + 1) * cellH, Math.ceil(cellW) + 0.2, Math.ceil(cellH) + 0.2);
    }
  }
  const currentX = left + (m.airflowMin - flowMin) / (flowMax - flowMin) * (right - left);
  const currentY = bottom - (m.ua - uaMin) / (uaMax - uaMin) * (bottom - top);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = WARM;
  ctx.beginPath();
  ctx.arc(currentX, currentY, 7, 0, Math.PI * 2);
  ctx.fill();
  const flowVals = [flowMin, (flowMin + flowMax) / 2, flowMax];
  const uaVals = [uaMin, (uaMin + uaMax) / 2, uaMax];
  ctx.fillStyle = MUTED;
  ctx.font = "12px Segoe UI, Microsoft YaHei, sans-serif";
  flowVals.forEach((flow, c) => ctx.fillText(fmt(flow, 0), left + c * ((right - left) / 2) - 6, bottom + 20));
  uaVals.forEach((ua, r) => ctx.fillText(fmt(ua, 2), 20, bottom - r * ((bottom - top) / 2) + 4));
  axisLabel(ctx, "m³/min", w / 2 - 24, h - 18);
  axisLabel(ctx, "UA kW/K", 18, 54);
}

function carnotPhases(m) {
  const p = (temp, volume) => m.visualR * temp / volume;
  const kHot = m.visualR * m.th;
  const kCold = m.visualR * m.tc;
  const kAd2 = p(m.th, m.points.v2) * Math.pow(m.points.v2, m.gamma);
  const kAd4 = p(m.tc, m.points.v4) * Math.pow(m.points.v4, m.gamma);
  return [
    { key: "hotIso", label: lang === "zh" ? "1-2 等温膨胀" : "1-2 Isothermal expansion", color: RED, v0: m.points.v1, v1: m.points.v2, fn: (v) => kHot / v },
    { key: "adiabaticExpansion", label: lang === "zh" ? "2-3 绝热膨胀" : "2-3 Adiabatic expansion", color: WARM, v0: m.points.v2, v1: m.points.v3, fn: (v) => kAd2 / Math.pow(v, m.gamma) },
    { key: "coldIso", label: lang === "zh" ? "3-4 等温压缩" : "3-4 Isothermal compression", color: CYAN, v0: m.points.v4, v1: m.points.v3, fn: (v) => kCold / v },
    { key: "adiabaticCompression", label: lang === "zh" ? "4-1 绝热压缩" : "4-1 Adiabatic compression", color: GREEN, v0: m.points.v1, v1: m.points.v4, fn: (v) => kAd4 / Math.pow(v, m.gamma) }
  ];
}

function drawCarnotPV(ctx, m, w, h) {
  title(ctx, i18n[lang].tabs.pvDiagram, lang === "zh" ? "左键点击图例隐藏/显示阶段" : "Click legend items to hide/show stages");
  const left = 80, right = w - 44, top = 72, bottom = h - 66;
  const phases = carnotPhases(m);
  const volumes = [m.points.v1, m.points.v2, m.points.v3, m.points.v4];
  const pressures = phases.flatMap((phase) => [phase.fn(phase.v0), phase.fn(phase.v1)]);
  const vMin = Math.min(...volumes) * 0.9;
  const vMax = Math.max(...volumes) * 1.08;
  const pMin = Math.min(...pressures) * 0.88;
  const pMax = Math.max(...pressures) * 1.12;
  const sx = (v) => left + (v - vMin) / (vMax - vMin) * (right - left);
  const sy = (p) => bottom - (p - pMin) / (pMax - pMin) * (bottom - top);
  carnotLegendHits = [];
  phases.forEach((phase) => {
    const visible = carnotPhaseVisible[phase.key];
    ctx.globalAlpha = visible ? 1 : 0.22;
    ctx.strokeStyle = phase.color;
    ctx.lineWidth = visible ? 4 : 2;
    ctx.beginPath();
    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const v = phase.v0 + (phase.v1 - phase.v0) * i / steps;
      const x = sx(v);
      const y = sy(phase.fn(v));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    if (visible) ctx.stroke();
    else ctx.stroke();
    ctx.globalAlpha = 1;
  });
  const legendX = left + 8;
  let legendY = bottom - 94;
  phases.forEach((phase) => {
    ctx.globalAlpha = carnotPhaseVisible[phase.key] ? 1 : 0.35;
    ctx.fillStyle = phase.color;
    ctx.fillRect(legendX, legendY - 10, 18, 10);
    ctx.fillStyle = BRAND;
    ctx.font = "700 12px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText(phase.label, legendX + 26, legendY);
    carnotLegendHits.push({ key: phase.key, x: legendX, y: legendY - 16, w: 180, h: 22 });
    legendY += 24;
    ctx.globalAlpha = 1;
  });
  axisLabel(ctx, "V", w / 2, h - 24);
  axisLabel(ctx, "P", 34, 78);
}

function drawCarnotTS(ctx, m, w, h) {
  title(ctx, i18n[lang].tabs.tsDiagram, `Qh ${fmt(m.heatIn, 0)} J · W ${fmt(m.netWork, 0)} J`);
  const left = 120, right = w - 120, top = 82, bottom = h - 88;
  const ds = Math.max(0.001, m.entropyDelta);
  const s1 = 0, s2 = ds;
  const tMin = m.tc * 0.92;
  const tMax = m.th * 1.06;
  const sx = (s) => left + (s - s1) / Math.max(0.001, s2 - s1) * (right - left);
  const sy = (temp) => bottom - (temp - tMin) / (tMax - tMin) * (bottom - top);
  ctx.fillStyle = "rgba(0,25,101,0.08)";
  ctx.fillRect(sx(s1), sy(m.th), sx(s2) - sx(s1), sy(m.tc) - sy(m.th));
  const pts = [[sx(s1), sy(m.th)], [sx(s2), sy(m.th)], [sx(s2), sy(m.tc)], [sx(s1), sy(m.tc)]];
  ctx.strokeStyle = BRAND;
  ctx.lineWidth = 5;
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
  ctx.closePath();
  ctx.stroke();
  pointLabel(ctx, pts[0][0], pts[0][1], RED, "1");
  pointLabel(ctx, pts[1][0], pts[1][1], RED, "2");
  pointLabel(ctx, pts[2][0], pts[2][1], CYAN, "3");
  pointLabel(ctx, pts[3][0], pts[3][1], CYAN, "4");
  axisLabel(ctx, "S J/(mol·K)", w / 2 - 36, h - 28);
  axisLabel(ctx, "T K", 36, 78);
}

function coilCapacity(v) {
  const airVolume = Math.max(0.1, v.airflowMin) / 60;
  const waterMass = Math.max(0.1, v.waterFlowMin) / 60;
  const cAir = 1.2 * airVolume * 1.006;
  const cWater = waterMass * 4.186;
  const cMin = Math.max(0.001, Math.min(cAir, cWater));
  const ntu = Math.max(0, v.ua / cMin);
  const effectiveness = 1 - Math.exp(-ntu);
  const capacity = effectiveness * cMin * Math.max(0, v.airInTemp - v.waterInTemp);
  return { capacity };
}

function heatColor(t) {
  const x = clamp(t, 0, 1);
  const r = Math.round(8 + x * 247);
  const g = Math.round(34 + Math.sin(x * Math.PI) * 126 + x * 75);
  const b = Math.round(102 + (1 - x) * 95 - x * 70);
  return `rgb(${r}, ${g}, ${b})`;
}

function drawBars(ctx, chart, w, h) {
  title(ctx, chart.title || (lang === "zh" ? "结果分解" : "Result Breakdown"), chart.unit);
  const max = Math.max(...chart.values, 1) * 1.18;
  const base = h - 62;
  const gap = (w - 130) / chart.values.length;
  chart.values.forEach((value, i) => {
    const x = 82 + i * gap;
    const bh = (value / max) * (h - 138);
    ctx.fillStyle = chart.colors[i];
    ctx.fillRect(x, base - bh, Math.max(48, gap * 0.45), bh);
    ctx.fillStyle = BRAND;
    ctx.font = "700 14px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText(fmt(value), x, base - bh - 10);
    ctx.fillStyle = MUTED;
    ctx.font = "12px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText(chart.labels[i], x, base + 22);
  });
}

function drawLines(ctx, chart, w, h) {
  title(ctx, chart.title || (lang === "zh" ? "动态曲线" : "Dynamic Curve"), chart.unit);
  const all = chart.series.flatMap((s) => s.values);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const sx = (i) => 78 + i * ((w - 134) / (chart.labels.length - 1));
  const sy = (v) => h - 62 - ((v - min) / Math.max(1, max - min)) * (h - 132);
  chart.series.forEach((s) => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    s.values.forEach((v, i) => i ? ctx.lineTo(sx(i), sy(v)) : ctx.moveTo(sx(i), sy(v)));
    ctx.stroke();
  });
  ctx.fillStyle = MUTED;
  ctx.font = "12px Segoe UI, Microsoft YaHei, sans-serif";
  chart.labels.forEach((label, i) => ctx.fillText(label, sx(i) - 8, h - 28));
  const named = chart.series.filter((s) => s.label);
  if (named.length) {
    let x = 76;
    named.forEach((s) => {
      ctx.fillStyle = s.color;
      ctx.fillRect(x, 54, 18, 8);
      ctx.fillStyle = BRAND;
      ctx.font = "700 12px Segoe UI, Microsoft YaHei, sans-serif";
      ctx.fillText(s.label, x + 24, 62);
      x += Math.min(190, 34 + s.label.length * 12);
    });
  }
}

function drawDewET(ctx, m, w, h) {
  title(ctx, i18n[lang].tabs.dewRh, `T ${fmt(m.temp)}°C · RH ${fmt(m.rh, 0)}% · P ${fmt(m.pressure, 1)} kPa`);
  const left = 78, right = w - 48, top = 72, bottom = h - 64;
  const xMin = Math.min(-20, Math.floor(Math.min(m.dp, m.temp) / 10) * 10 - 10);
  const xMax = Math.max(50, Math.ceil(Math.max(m.temp, m.dp) / 10) * 10 + 10);
  const yMax = Math.max(8, satPressure(xMax) * 1.08);
  const sx = (temp) => left + (temp - xMin) / (xMax - xMin) * (right - left);
  const sy = (pv) => bottom - pv / yMax * (bottom - top);
  const drawCurve = (rh, color, width = 2) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    const steps = 140;
    for (let i = 0; i <= steps; i++) {
      const temp = xMin + (xMax - xMin) * i / steps;
      const pv = satPressure(temp) * rh / 100;
      if (i === 0) ctx.moveTo(sx(temp), sy(pv));
      else ctx.lineTo(sx(temp), sy(pv));
    }
    ctx.stroke();
  };
  [20, 40, 60, 80].forEach((rh, i) => drawCurve(rh, [LINE, "#b8c8e8", CYAN, "#4d78c8"][i], 2));
  drawCurve(100, BRAND, 4);
  ctx.strokeStyle = RED;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(sx(m.dp), bottom);
  ctx.lineTo(sx(m.dp), sy(m.pv));
  ctx.lineTo(left, sy(m.pv));
  ctx.stroke();
  ctx.setLineDash([]);
  pointLabel(ctx, sx(m.temp), sy(m.pv), WARM, lang === "zh" ? "当前" : "Current");
  pointLabel(ctx, sx(m.dp), sy(m.pv), RED, lang === "zh" ? "露点" : "Dew point");
  ctx.fillStyle = MUTED;
  ctx.font = "12px Segoe UI, Microsoft YaHei, sans-serif";
  [20, 40, 60, 80, 100].forEach((rh) => {
    const tx = xMax - 6;
    ctx.fillText(`${rh}%`, sx(tx) - 2, sy(satPressure(tx) * rh / 100) - 4);
  });
  const xticks = [xMin, (xMin + xMax) / 2, xMax];
  const yticks = [0, yMax / 2, yMax];
  xticks.forEach((temp) => ctx.fillText(fmt(temp, 0), sx(temp) - 10, bottom + 22));
  yticks.forEach((pv) => ctx.fillText(fmt(pv, 1), 24, sy(pv) + 4));
  axisLabel(ctx, "T °C", w / 2 - 14, h - 24);
  axisLabel(ctx, "e kPa", 26, 74);
}

function drawCycle(ctx, chart, w, h) {
  title(ctx, lang === "zh" ? "T-S 循环" : "T-S Cycle", "°C");
  const x1 = 220, x2 = w - 220, y1 = 102, y2 = h - 106;
  ctx.strokeStyle = BRAND;
  ctx.lineWidth = 5;
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.fillStyle = RED;
  ctx.fillRect(x1, y1 - 26, x2 - x1, 8);
  ctx.fillStyle = CYAN;
  ctx.fillRect(x1, y2 + 20, x2 - x1, 8);
  ctx.fillStyle = BRAND;
  ctx.font = "700 16px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.fillText(`Th ${fmt(chart.hot)}°C`, x1, y1 - 34);
  ctx.fillText(`Tc ${fmt(chart.cold)}°C`, x1, y2 + 52);
}

function drawPsych(ctx, chart, w, h) {
  title(ctx, lang === "zh" ? "湿空气状态路径" : "Psychrometric Path", "g/kg dry air");
  const xMin = 5, xMax = 40, yMin = 0, yMax = 28;
  const sx = (x) => 70 + (x - xMin) / (xMax - xMin) * (w - 126);
  const sy = (y) => h - 60 - (y - yMin) / (yMax - yMin) * (h - 130);
  ctx.strokeStyle = BRAND;
  ctx.lineWidth = 3;
  ctx.beginPath();
  chart.points.forEach((p, i) => i ? ctx.lineTo(sx(p.x), sy(p.y)) : ctx.moveTo(sx(p.x), sy(p.y)));
  ctx.stroke();
  chart.points.forEach((p) => pointLabel(ctx, sx(p.x), sy(p.y), p.color, p.name));
}

function axisLabel(ctx, text, x, y) {
  ctx.fillStyle = MUTED;
  ctx.font = "12px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.fillText(text, x, y);
}

function pointLabel(ctx, x, y, color, text) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BRAND;
  ctx.font = "700 13px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.fillText(text, x + 10, y - 8);
}

function startAnimation(config) {
  cancelAnimationFrame(rafId);
  const canvas = document.getElementById("animationCanvas");
  const ctx = canvas.getContext("2d");
  const draw = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animations[config.type](ctx, canvas.width, canvas.height, time / 1000, config);
    rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
}

const animations = {
  cycle(ctx, w, h, time) {
    const pts = [[250, 56], [650, 56], [650, 164], [250, 164]];
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 5;
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    ctx.closePath();
    ctx.stroke();
    const seg = Math.floor(time % 4);
    const p1 = pts[seg];
    const p2 = pts[(seg + 1) % 4];
    const f = time % 1;
    pointLabel(ctx, p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f, WARM, "Carnot");
  },
  tower(ctx, w, h, time) {
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 5;
    ctx.strokeRect(w / 2 - 100, 24, 200, 170);
    for (let i = 0; i < 28; i++) {
      point(ctx, w / 2 - 80 + (i % 7) * 26, 38 + ((time * 45 + i * 19) % 142), i % 2 ? CYAN : BLUE, 4);
    }
  },
  dew(ctx, w, h, time, c) {
    const drops = Math.round(6 + clamp(c.rh, 0, 100) / 4);
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 62, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < drops; i++) point(ctx, 80 + ((time * 55 + i * 73) % (w - 160)), 50 + ((time * 34 + i * 29) % 120), CYAN, 5);
  },
  building(ctx, w, h, time) {
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 5;
    ctx.strokeRect(w / 2 - 120, 50, 240, 120);
    for (let i = 0; i < 14; i++) {
      const x = w / 2 - 100 + i * 15;
      ctx.strokeStyle = i % 2 ? RED : WARM;
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x - 30 - Math.sin(time + i) * 8, 18);
      ctx.stroke();
    }
  },
  cop(ctx, w, h, time, c) {
    const r = Math.max(28, 90 - c.lift);
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const a = time * 1.6 + i * Math.PI * 0.2;
      point(ctx, w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, i % 2 ? CYAN : WARM, 5);
    }
  },
  ahu(ctx, w, h, time) {
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 4;
    ctx.strokeRect(w / 2 - 88, 62, 176, 96);
    for (let i = 0; i < 28; i++) point(ctx, 42 + ((time * 110 + i * 38) % (w - 84)), h / 2 + Math.sin(time * 2 + i) * 38, i % 3 ? BLUE : CYAN, 4);
  }
};

function point(ctx, x, y, color, radius) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function collectInputs() {
  return toolFields[activeTool].map((field) => {
    const normalized = Array.isArray(field) ? { key: field[0], unit: field[2], type: "number" } : field;
    const raw = values[activeTool][normalized.key];
    return {
      label: i18n[lang].fields[normalized.key],
      value: normalized.type === "select" ? (i18n[lang].options[raw] || raw) : raw,
      unit: normalized.unit || ""
    };
  });
}

function collectMetrics() {
  const result = calculators[activeTool](values[activeTool]);
  const box = document.createElement("div");
  box.innerHTML = result.metrics.join("");
  return Array.from(box.querySelectorAll(".metric")).map((node) => ({
    value: node.querySelector("strong")?.textContent || "",
    label: node.querySelector("span")?.textContent || ""
  }));
}

function chartImage(chart) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 650;
  drawChartToCanvas(canvas, chart);
  return canvas.toDataURL("image/png", 1);
}

function collectCharts(result) {
  const tabs = tabsByTool[activeTool] || [];
  if (!tabs.length) return [{ title: i18n[lang].tabs[activeVizTab] || i18n[lang].report.charts, src: chartImage(result.chart) }];
  const previous = activeVizTab;
  const charts = tabs.map((tab) => {
    activeVizTab = tab;
    const tabResult = calculators[activeTool](values[activeTool]);
    return {
      title: i18n[lang].tabs[tab],
      src: chartImage(tabResult.chart)
    };
  });
  activeVizTab = previous;
  return charts;
}

function formatReportTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getFullYear() % 100)}${pad(date.getMonth() + 1)}${pad(date.getDate())}/${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildReportHtml() {
  const dict = i18n[lang];
  const result = calculators[activeTool](values[activeTool]);
  const inputs = collectInputs();
  const metrics = collectMetrics();
  const charts = collectCharts(result);
  const time = formatReportTimestamp();

  return `
    <div class="report-content">
      <header class="report-header">
        <h1>${escapeHtml(dict.tools[activeTool].title)} · ${escapeHtml(dict.report.subtitle)}</h1>
        <p>Thermal Engineering</p>
      </header>

      <section class="report-section">
        <h2>${escapeHtml(dict.report.inputs)}</h2>
        <div class="report-grid">
          ${inputs.map((item) => `
            <div class="report-item">
              <strong>${escapeHtml(item.value)} ${escapeHtml(item.unit)}</strong>
              ${escapeHtml(item.label)}
            </div>
          `).join("")}
        </div>
      </section>

      <section class="report-section">
        <h2>${escapeHtml(dict.report.results)}</h2>
        <div class="report-grid">
          ${metrics.map((item) => `
            <div class="report-item">
              <strong>${escapeHtml(item.value)}</strong>
              ${escapeHtml(item.label)}
            </div>
          `).join("")}
        </div>
      </section>

      <section class="report-section">
        <h2>${escapeHtml(dict.report.charts)}</h2>
        ${charts.map((chart) => `
          <figure class="report-chart">
            <img src="${chart.src}" alt="${escapeHtml(chart.title)}" />
            <figcaption class="report-text">${escapeHtml(chart.title)}</figcaption>
          </figure>
        `).join("")}
      </section>

      <section class="report-section">
        <h2>${escapeHtml(dict.report.formula)}</h2>
        <p class="report-text">${escapeHtml(result.formula || dict.formulas.default)}</p>
      </section>

      <footer class="report-footer">${escapeHtml(dict.report.printedAt)}: ${escapeHtml(time)}</footer>
    </div>
  `;
}

function exportPdf() {
  const report = document.getElementById("printReport");
  report.innerHTML = buildReportHtml();
  report.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    window.print();
    report.setAttribute("aria-hidden", "true");
  });
}

document.getElementById("langToggle").addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  render();
});

document.getElementById("mainChart").addEventListener("click", (event) => {
  if (activeTool !== "carnot" || activeVizTab !== "pvDiagram" || !carnotLegendHits.length) return;
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * canvas.width / rect.width;
  const y = (event.clientY - rect.top) * canvas.height / rect.height;
  const hit = carnotLegendHits.find((item) => x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h);
  if (!hit) return;
  carnotPhaseVisible[hit.key] = !carnotPhaseVisible[hit.key];
  updateResults();
});

document.getElementById("exportPdf").addEventListener("click", exportPdf);

render();
