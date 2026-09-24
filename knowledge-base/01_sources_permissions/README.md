# 01 来源、证据、权限与口径 (Sources & Permissions)

本模块是公开发布的单一事实闸门。现有 PIM、站点矩阵和生成器中的企业、产品、价格、产能、验厂、认证、ESG 与客户关系信息均视为待核验草稿，不得因为文件已存在就当作事实。

## 发布规则

一条声明只有同时满足以下条件才能对外使用：

1. `status` 为 `verified_fact`；
2. `public_claim_approved` 为 `true`；
3. `source_refs` 至少包含一份可追溯证据；
4. 有 `verified_by` 与 `verified_at`；
5. 有效期 `valid_until` 未过期；
6. 证据的 SKU、材料、市场、工厂主体和使用范围与当前声明一致。

证据状态在 [`evidence-register.json`](evidence-register.json) 维护，结构由 [`schemas/evidence-register.schema.json`](../../schemas/evidence-register.schema.json) 定义。

## 最小核验流程

1. 将受控原件保存在企业授权的文档系统，仓库只记录文件名、文档编号、日期和可访问位置；
2. 由对应业务负责人确认证据范围与对外使用权限；
3. 更新证据台账，不得伪造、猜测或只填网络搜索结果；
4. 运行 `npm run verify:publish`；
5. 证书、价格、产能或法规变更时，立即将对应记录改为 `deprecated` 或 `pending_supplement`。

## 敏感信息

银行账号、底价、毛利、客户名单、未公开合同、证书原件和个人数据不得提交到公共仓库。收款信息变更必须通过企业现有的双重授权渠道核验，不能只依赖电子邮件。
