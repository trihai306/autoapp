import Marks from "./Marks"
import classNames from "../utils/classNames"

export function Track({
  filled,
  children,
  offset,
  disabled,
  marksOffset,
  containerProps,
  trackClass,
  barClass,
  markClass,
  ...rest
}) {
  return (
    <div className="slider-track-wrapper" {...containerProps}>
      <div className={classNames("slider-track", trackClass)}>
        <div
          className={classNames("slider-bar", disabled && "disabled", barClass)}
          style={{
            width: `calc(${filled}% + 6px)`,
            ...(offset && {
              insetInlineStart: `calc(${offset}% - 6px)`
            }),
            insetInlineStart: `calc(${offset}% - 6px)`
          }}
        />

        {children}
        <Marks
          {...rest}
          markClass={markClass}
          offset={marksOffset}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
export default Track
