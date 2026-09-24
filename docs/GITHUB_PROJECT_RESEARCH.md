# GitHub 项目补强调研

> 调研快照：2026-09-24。Star 数只用于判断社区成熟度，不代表功能一定适合本仓库。选型优先级为：事实安全 > 许可证兼容 > 直接解决当前缺口 > 活跃维护 > Star 数。

## 结论

当前最适合的组合是“轻量规范 + 本地闸门”：

1. 复用 [RenWork Export KB Suite](https://github.com/cnproduct/renwork-export-kb-suite) 的六态事实治理、`public_claim_approved` 和知识卡字段；
2. 按 [AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt) v2 格式生成简短导航文件，不把未核验宣传语塞进 `llms.txt`；
3. 按 [SchemaStore](https://github.com/SchemaStore/schemastore) 模式为证据台账和知识卡提供 JSON Schema；
4. 用 [lychee-action](https://github.com/lycheeverse/lychee-action) 在 CI 中检查 README 和调研文档链接。

这四项已落地。没有复制第三方项目代码；引用的 GitHub Action 已固定到具体 commit。

## 候选项目与取舍

| 项目 | 快照 Star | 许可证 | 适配结论 |
|---|---:|---|---|
| [cnproduct/renwork-export-kb-suite](https://github.com/cnproduct/renwork-export-kb-suite) | 0 | MIT | **已复用**。与本仓库同源，直接补上六态事实、敏感度、来源与公开发布闸门。 |
| [AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt) | 2,629 | Apache-2.0 | **已采用规范**。修正 `llms-generator.mjs`，输出 H1、摘要、分组 Markdown 链接和可选资源。 |
| [SchemaStore/schemastore](https://github.com/SchemaStore/schemastore) | 3,846 | Apache-2.0 | **已采用模式**。新增本地 JSON Schema，保持编辑器友好且不增加运行时依赖。 |
| [lycheeverse/lychee-action](https://github.com/lycheeverse/lychee-action) | 514 | Apache-2.0 | **已集成**。只检查 README/调研文档，避免将尚未上线的 20 个域名误判为 CI 故障。 |
| [schemaorg/schemaorg](https://github.com/schemaorg/schemaorg) | 6,258 | Apache-2.0 | **规范参考**。后续应对生成的 `Product`/`Organization` JSON-LD 做字段级验证；当前在证据未批准前不生成公开 Offer。 |
| [microsoft/markitdown](https://github.com/microsoft/markitdown) | 186,692 | MIT | **候选导入器**。适合把企业授权的 PDF/DOCX/XLSX 转为可检索 Markdown；只有收到真实原始文件时才需要安装。 |
| [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse) | 30,804 | Apache-2.0 | **部署后验收**。用于实际网站的性能、可访问性、SEO 与最佳实践；不应塞入当前知识库运行时。 |
| [Shopify/product-taxonomy](https://github.com/Shopify/product-taxonomy) | 362 | MIT | **候选分类映射**。适合上线 Shopify/零售渠道时补商品分类；它不能证明产品参数或认证。 |
| [DavidAnson/markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) | 925 | MIT | **暂不集成**。可以改善 Markdown 风格，但现阶段的核心问题是事实证据，不是排版一致性。 |
| [OpenSPG/KAG](https://github.com/OpenSPG/KAG) | 9,073 | Apache-2.0 | **不集成**。适合大型专业知识推理，但当前只有 21 个轻量模块和 9 个 SKU，运维成本大于收益。 |
| [microsoft/graphrag](https://github.com/microsoft/graphrag) | 36,085 | MIT | **不集成**。关系图检索不能修复虚构事实；先建立可追溯证据才有意义。 |
| [pimcore/pimcore](https://github.com/pimcore/pimcore) | 3,853 | 混合/其他 | **只作架构参考**。全功能 PIM/MDM/DAM 远超 9 SKU 需求，许可和部署复杂度也不适合直接合并。 |
| [akeneo/pim-community-dev](https://github.com/akeneo/pim-community-dev) | 1,046 | OSL-3.0/其他 | **不复制代码**。可借鉴属性、分类、渠道和完整度概念，但许可证和体量不适合当前 MIT 小型仓库。 |

## 后续引入条件

- 收到授权的 PDF/DOCX/XLSX 证据批次后，再增加 MarkItDown 导入脚本；
- 首个公开站点可访问后，再增加 Lighthouse 与结构化数据实页验收；
- SKU 达到数百、多人同时维护或需要 ERP/电商双向同步时，再评估独立 PIM；
- 经过核验的知识卡达到数千张，且普通关键词/向量检索已无法支持跨文档推理时，再评估 KAG 或 GraphRAG。
