/**
 * 代码千万行 注释第一行
 * 编码不规范 阅读两行泪
 *
 * @Author       : wenhao.huang
 * @Date         : 2020-06-15 14:47:11
 * @LastEditors  : wenhao.huang
 * @LastEditTime : 2020-06-15 15:04:20
 */
import debounce from "throttle-debounce/debounce";
import { getStyle, hasClass } from "./util";

export default {
  name: "HDetail",
  components: {
    DetailItem: {
      name: "DetailItem",
      props: {
        label: {
          type: Object,
          default: () => {}
        },
        effect: {
          type: String,
          default: ""
        },
        data: {
          type: [String, Number, Boolean],
          default: ""
        }
      },
      data() {
        return {
          tooltipContent: ""
        };
      },
      created() {
        this.activateTooltip = debounce(50, tooltip =>
          tooltip.handleShowPopper()
        );
      },
      methods: {
        handleCellMouseEnter(event, label, data) {
          // 判断是否text-overflow, 如果是就显示tooltip
          const cellChild = event.target;
          if (!hasClass(cellChild, "el-tooltip")) {
            return;
          }
          const range = document.createRange();
          range.setStart(cellChild, 0);
          range.setEnd(cellChild, cellChild.childNodes.length);
          const rangeWidth = range.getBoundingClientRect().width;
          const padding =
            (parseInt(getStyle(cellChild, "paddingLeft"), 10) || 0) +
            (parseInt(getStyle(cellChild, "paddingRight"), 10) || 0);
          if (
            (rangeWidth + padding > cellChild.offsetWidth ||
              cellChild.scrollWidth > cellChild.offsetWidth) &&
            this.$refs.tooltip
          ) {
            const tooltip = this.$refs.tooltip;
            this.tooltipContent = data || cellChild.innerText;
            tooltip.referenceElm = cellChild;
            tooltip.$refs.popper &&
              (tooltip.$refs.popper.style.display = "none");
            tooltip.doDestroy();
            tooltip.setExpectedState(true);
            this.activateTooltip(tooltip);
          }
        },
        handleCellMouseLeave() {
          const tooltip = this.$refs.tooltip;
          if (tooltip) {
            tooltip.setExpectedState(false);
            tooltip.handleClosePopper();
          }
        }
      },
      render(h) {
        const {
          render,
          span,
          label,
          labelWidth,
          labelPosition,
          labelSuffix,
          showOverflowTooltip = false,
          tooltipEffect = "dark",
          cellStyle,
          cellClassName
        } = this.label;
        let itemClass = "h-detail--item__content";
        const template = (
          <div class={["h-detail--item", `span__${span}`]}></div>
        );
        template.children = template.children || [];
        if (cellClassName) {
          itemClass += ` ${cellClassName(this.data, this.$parent.data)}`
        }
        // label存在内容，则渲染label
        if (label) {
          const styleFn = Object.assign(
            {},
            labelWidth ? { width: labelWidth } : {},
            labelPosition ? { textAlign: labelPosition } : {}
          );
          const labelContent = (
            <div class="h-detail--item__label" style={styleFn}>
              {label}
              {this.effect === "table" ? "" : labelSuffix}
            </div>
          );
          template.children.push(labelContent);
        }
        let _template = render
          ? render(h, { data: this.data, row: this.$parent.data })
          : typeof this.data === "boolean"
          ? `${this.data}`
          : this.data;
        if (showOverflowTooltip) {
          itemClass += " el-tooltip";
          template.children.push(
            <el-tooltip
              effect={tooltipEffect}
              placement="top"
              ref="tooltip"
              content={this.tooltipContent}
            ></el-tooltip>
          );
        }
        template.children.push(
          <div
            class={itemClass}
            style={cellStyle ? cellStyle(this.data, this.$parent.data) : undefined}
            on-mouseenter={$event =>
              this.handleCellMouseEnter($event, this.label, this.data)
            }
            on-mouseleave={this.handleCellMouseLeave}
          >
            {_template}
          </div>
        );
        return template;
      }
    }
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    columns: {
      type: Object,
      default: () => ({})
    },
    effect: {
      type: String,
      default: ""
    },
    span: {
      type: Number,
      default: 8
    },
    labelWidth: {
      type: String,
      default: ""
    },
    labelPosition: {
      type: String,
      default: ""
    },
    labelSuffix: {
      type: String,
      default: "："
    },
    title: {
      type: String,
      default: "详情展示"
    }
  },
  render() {
    const template = <section class="h-detail" />;
    template.children = template.children || [];
    const { span, labelWidth, labelPosition, labelSuffix, title } = this;
    if (title) {
      template.children.push(<div class="h-detail-title">{title}</div>);
    }
    const contentList = [];
    for (const item in this.columns) {
      const data = this.data[item];
      const label = this.columns[item];
      const labelItem = Object.assign(
        { span, labelWidth, labelPosition, labelSuffix },
        typeof label === "string" ? { label } : label,
        { span: label.span ? label.span : span }
      );
      let { visible = true } = this.columns[item];
      if (typeof visible === "function") {
        visible = visible({ row: this.data, item: data });
      }
      if (visible !== false) {
        contentList.push(
          <detail-item data={data} label={labelItem} effect={this.effect} />
        );
      }
    }
    template.children.push(
      <div
        class={[
          "h-detail-content",
          this.effect === "table" ? "h-detail__table" : ""
        ]}
      >
        {contentList}
      </div>
    );
    return template;
  }
};
