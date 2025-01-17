import React, { FC, Ref, useEffect, useMemo, useRef, useState } from 'react';

// Styles:
import styles from './avatar.module.scss';
import {
  AvatarFallbackProps,
  AvatarIconProps,
  AvatarOutlineProps,
  AvatarProps,
  BaseAvatarProps,
  StatusItemIconAlign,
  StatusItemsPosition,
  StatusItemsProps,
} from './';
import { ConditionalWrapper, mergeClasses } from '../../shared/utilities';
import { Icon } from '../Icon';
import { useCanvasDirection } from '../../hooks/useCanvasDirection';
import { Tooltip } from '../Tooltip';

export const AVATAR_THEME_SET = [
  styles.red,
  styles.redOrange,
  styles.orange,
  styles.yellow,
  styles.yellowGreen,
  styles.green,
  styles.blueGreen,
  styles.blue,
  styles.blueViolet,
  styles.violet,
  styles.violetRed,
  styles.grey,
];

export const getStatusItemSizeAndPadding = (
  avatarSize: number
): [number, number] => {
  // Returns: [status item size, status item padding]
  const statusItemSize: number = (avatarSize * 16) / 100;
  return [statusItemSize, (statusItemSize * 6) / 16];
};

// 0.06 factor is chosen based on design
const StatusItemWrapperPaddingFactor: number = 0.06;
const DefaultStatusItemMaxTextLength: number = 3;
const MinStatusItemFontSize: number = 12;
const StatusItemFontDiff: string = '2px';

const StatusItemOutlineDefaults: React.CSSProperties = {
  outlineColor: 'var(--grey-color-80)',
  outlineOffset: '0px',
  outlineStyle: 'solid',
  outlineWidth: '2px',
};

const AvatarOutlineDefaults: React.CSSProperties = {
  outlineColor: 'var(--green-color-60)',
  outlineOffset: '2px',
  outlineStyle: 'solid',
  outlineWidth: '4px',
};

const statusItemPositionRtlMap: {
  [key in StatusItemsPosition]: StatusItemsPosition;
} = {
  [StatusItemsPosition.Top]: StatusItemsPosition.Top,
  [StatusItemsPosition.Bottom]: StatusItemsPosition.Bottom,
  [StatusItemsPosition.Left]: StatusItemsPosition.Right,
  [StatusItemsPosition.Right]: StatusItemsPosition.Left,
  [StatusItemsPosition.TopRight]: StatusItemsPosition.TopLeft,
  [StatusItemsPosition.TopLeft]: StatusItemsPosition.TopRight,
  [StatusItemsPosition.BottomRight]: StatusItemsPosition.BottomLeft,
  [StatusItemsPosition.BottomLeft]: StatusItemsPosition.BottomRight,
};

const AvatarStatusItems: FC<BaseAvatarProps> = React.forwardRef(
  ({ outline, size, statusItems }, ref: Ref<HTMLDivElement>) => {
    const statusItemsRef = useRef<{
      [key in StatusItemsPosition]?: HTMLSpanElement;
    }>({});
    const [showStatusItemsText, setShowStatusItemsText] = useState<{
      [key in StatusItemsPosition]?: boolean;
    }>({});
    const htmlDir: string = useCanvasDirection();

    const updateStatusItemTextVisibility = (position: StatusItemsPosition) => {
      const value = statusItemsRef.current[position];
      if (value === undefined) {
        return;
      }
      const styles = getComputedStyle(value); // getComputedStyle always outputs a pixel value
      // We do slice to remove "px"
      setShowStatusItemsText((prevState) => ({
        ...prevState,
        [position]:
          parseInt(styles.fontSize.slice(0, -2)) >= MinStatusItemFontSize,
      }));
    };

    useEffect(() => {
      updateStatusItemTextVisibility(StatusItemsPosition.Top);
      updateStatusItemTextVisibility(StatusItemsPosition.Bottom);
      updateStatusItemTextVisibility(StatusItemsPosition.Left);
      updateStatusItemTextVisibility(StatusItemsPosition.Right);
      updateStatusItemTextVisibility(StatusItemsPosition.TopRight);
      updateStatusItemTextVisibility(StatusItemsPosition.TopLeft);
      updateStatusItemTextVisibility(StatusItemsPosition.BottomRight);
      updateStatusItemTextVisibility(StatusItemsPosition.BottomLeft);
    }, [statusItemsRef.current]);

    const getStatusItemPositionStyle = (
      itemPos: StatusItemsPosition
    ): React.CSSProperties => {
      const outlineWidth: string = outline?.outlineWidth ?? '0px'; // Avatar outline width
      const outlineOffset: string = outline?.outlineOffset ?? '0px'; // Avatar outline offset
      const radius: string = `calc((${size} + ${outlineWidth} + ${outlineOffset}) / 2)`;

      switch (htmlDir === 'rtl' ? statusItemPositionRtlMap[itemPos] : itemPos) {
        case StatusItemsPosition.TopRight:
          return {
            transform: `rotate(${-45}deg) translate(${radius}) rotate(${45}deg)`,
          };
        case StatusItemsPosition.TopLeft:
          return {
            transform: `rotate(${-135}deg) translate(${radius}) rotate(${135}deg)`,
          };
        case StatusItemsPosition.BottomRight:
          return {
            transform: `rotate(${45}deg) translate(${radius}) rotate(${-45}deg)`,
          };
        case StatusItemsPosition.BottomLeft:
          return {
            transform: `rotate(${135}deg) translate(${radius}) rotate(${-135}deg)`,
          };
        case StatusItemsPosition.Left:
          return {
            transform: `rotate(${180}deg) translate(${radius}) rotate(${-180}deg)`,
          };
        case StatusItemsPosition.Right:
          return { transform: `translate(${radius})` };
        case StatusItemsPosition.Top:
          return {
            transform: `rotate(${-90}deg) translate(${radius}) rotate(${90}deg)`,
          };
        case StatusItemsPosition.Bottom:
        default:
          return {
            transform: `rotate(${90}deg) translate(${radius}) rotate(${-90}deg)`,
          };
      }
    };

    return (
      <>
        {Object.keys(statusItems).map((position: StatusItemsPosition) => {
          const statusItemProps: StatusItemsProps = statusItems[position];
          const alignIcon: StatusItemIconAlign =
            statusItemProps.alignIcon ?? StatusItemIconAlign.Right;
          const showStatusItemText: boolean =
            statusItemProps.text &&
            statusItemProps.text.length <=
              (statusItemProps.textMaxLength ?? DefaultStatusItemMaxTextLength);
          const wrapperPadding: string | number =
            statusItemProps?.wrapperStyle?.padding ??
            `(${size} * ${StatusItemWrapperPaddingFactor})`;
          const statusItemTextClasses = mergeClasses([
            styles.avatarStatusItemText,
            { [styles.avatarStatusItemTextRtl]: htmlDir === 'rtl' },
            {
              [styles.textMarginRight]: alignIcon == StatusItemIconAlign.Right,
            },
            { [styles.textMarginLeft]: alignIcon == StatusItemIconAlign.Left },
          ]);
          const statusItemIconElement = (
            <Icon
              {...statusItemProps}
              classNames={styles.avatarStatusItemIcon}
            />
          );
          return (
            <div
              key={position}
              ref={ref}
              style={{
                background:
                  statusItemProps.backgroundColor ??
                  'var(--avatar-status-item-background)',
                padding: `calc(${wrapperPadding})`,
                ...getStatusItemPositionStyle(position),
                ...(statusItemProps.outline
                  ? {
                      outlineColor:
                        statusItemProps.outline?.outlineColor ??
                        StatusItemOutlineDefaults.outlineColor,
                      outlineOffset:
                        statusItemProps.outline?.outlineOffset ??
                        StatusItemOutlineDefaults.outlineOffset,
                      outlineStyle:
                        statusItemProps.outline?.outlineStyle ??
                        StatusItemOutlineDefaults.outlineStyle,
                      outlineWidth:
                        statusItemProps.outline?.outlineWidth ??
                        StatusItemOutlineDefaults.outlineWidth,
                    }
                  : {}),
                ...(statusItemProps.wrapperStyle ?? {}),
              }}
              className={`${styles.avatarStatusItem} ${
                statusItemProps.wrapperClassName ?? ''
              } ${statusItemProps.onClick ? styles.clickable : ''}`}
              {...(statusItemProps.onClick
                ? {
                    onClick: statusItemProps.onClick,
                    role: 'button',
                  }
                : {})}
              {...(statusItemProps.ariaLabel
                ? { 'aria-label': statusItemProps.ariaLabel }
                : {})}
            >
              {alignIcon == StatusItemIconAlign.Left && statusItemIconElement}
              {showStatusItemText && (showStatusItemsText[position] ?? true) && (
                <span
                  ref={(el) => (statusItemsRef.current[position] = el)}
                  style={{
                    color: statusItemProps.color,
                    fontSize: `calc(${statusItemProps.size} + ${StatusItemFontDiff})`,
                    lineHeight: statusItemProps.size,
                  }}
                  className={statusItemTextClasses}
                >
                  {statusItemProps.text}
                </span>
              )}
              {alignIcon == StatusItemIconAlign.Right && statusItemIconElement}
            </div>
          );
        })}
      </>
    );
  }
);

const AvatarFallback: FC<AvatarFallbackProps> = React.forwardRef(
  (
    { children, classNames, style, hashingFunction, theme, randomiseTheme },
    ref: Ref<HTMLDivElement>
  ) => {
    const colorSetIndex: number = useMemo(() => {
      if (randomiseTheme) {
        return Math.floor(Math.random() * 100) % AVATAR_THEME_SET.length;
      }
      if (hashingFunction) {
        return Math.floor(hashingFunction()) % AVATAR_THEME_SET.length;
      }
      return -1;
    }, []);

    const avatarClasses: string = mergeClasses([
      styles.wrapperStyle,
      styles.avatar,
      classNames,
      { [styles.red]: theme === 'red' },
      { [styles.redOrange]: theme === 'redOrange' },
      { [styles.orange]: theme === 'orange' },
      { [styles.yellow]: theme === 'yellow' },
      { [styles.yellowGreen]: theme === 'yellowGreen' },
      { [styles.green]: theme === 'green' },
      { [styles.blueGreen]: theme === 'blueGreen' },
      { [styles.blue]: theme === 'blue' },
      { [styles.blueViolet]: theme === 'blueViolet' },
      { [styles.violet]: theme === 'violet' },
      { [styles.violetRed]: theme === 'violetRed' },
      { [styles.grey]: theme === 'grey' },
      AVATAR_THEME_SET?.[colorSetIndex],
    ]);

    return (
      <div ref={ref} className={avatarClasses} style={style}>
        {children}
      </div>
    );
  }
);

const AvatarIcon: FC<AvatarIconProps> = React.forwardRef(
  (
    { children, classNames, fontSize, iconProps, style },
    ref: Ref<HTMLDivElement>
  ) => {
    const wrapperClasses: string = mergeClasses([
      styles.wrapperStyle,
      styles.avatar,
      classNames,
    ]);

    return (
      <div ref={ref} className={wrapperClasses} style={style}>
        <Icon size={fontSize} {...iconProps} />
        {children}
      </div>
    );
  }
);

export const Avatar: FC<AvatarProps> = React.forwardRef(
  (
    {
      classNames,
      src,
      alt,
      size = '32px',
      type = 'square',
      style = {},
      fontSize = '18px',
      iconProps,
      outline,
      statusItems = {},
      children,
      hashingFunction,
      theme,
      randomiseTheme,
      tooltipProps = undefined,
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const imageClasses: string = mergeClasses([
      styles.avatar,
      styles.imageStyle,
      { [styles.roundImage]: type === 'round' },
    ]);

    let calculatedOutline: AvatarOutlineProps = undefined;
    if (outline !== undefined) {
      calculatedOutline = {
        outlineColor:
          outline?.outlineColor ?? AvatarOutlineDefaults.outlineColor,
        outlineOffset:
          outline?.outlineOffset ??
          AvatarOutlineDefaults.outlineOffset.toString(),
        outlineStyle:
          outline?.outlineStyle ?? AvatarOutlineDefaults.outlineStyle,
        outlineWidth:
          outline?.outlineWidth ??
          AvatarOutlineDefaults.outlineWidth.toString(),
      };
    }

    const wrapperContainerStyle: React.CSSProperties = {
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      fontSize: fontSize,
      ...style,
      ...(Object.keys(statusItems).length > 0 ? { position: 'relative' } : {}),
    };

    if (src) {
      return (
        <ConditionalWrapper
          condition={tooltipProps !== undefined}
          wrapper={(children: React.ReactNode): JSX.Element => (
            <Tooltip {...tooltipProps}>{children}</Tooltip>
          )}
        >
          <div
            ref={ref}
            style={wrapperContainerStyle}
            className={`${classNames} ${styles.avatarImgWrapper}`}
          >
            <img
              src={src}
              className={imageClasses}
              style={calculatedOutline}
              alt={alt}
              width={size}
              height={size}
            />
            <AvatarStatusItems
              outline={calculatedOutline}
              size={size}
              statusItems={statusItems}
            />
          </div>
        </ConditionalWrapper>
      );
    }

    const wrapperClasses: string = mergeClasses([classNames, imageClasses]);

    if (iconProps) {
      return (
        <ConditionalWrapper
          condition={tooltipProps !== undefined}
          wrapper={(children: React.ReactNode): JSX.Element => (
            <Tooltip {...tooltipProps}>{children}</Tooltip>
          )}
        >
          <AvatarIcon
            iconProps={iconProps}
            classNames={wrapperClasses}
            style={{ ...wrapperContainerStyle, ...(calculatedOutline ?? {}) }}
            fontSize={fontSize}
            ref={ref}
          >
            <AvatarStatusItems
              outline={calculatedOutline}
              size={size}
              statusItems={statusItems}
            />
          </AvatarIcon>
        </ConditionalWrapper>
      );
    }

    return (
      <ConditionalWrapper
        condition={tooltipProps !== undefined}
        wrapper={(children: React.ReactNode): JSX.Element => (
          <Tooltip {...tooltipProps}>{children}</Tooltip>
        )}
      >
        <AvatarFallback
          classNames={wrapperClasses}
          style={{ ...wrapperContainerStyle, ...(calculatedOutline ?? {}) }}
          ref={ref}
          hashingFunction={hashingFunction}
          theme={theme}
          randomiseTheme={randomiseTheme}
        >
          {children}
          <AvatarStatusItems
            outline={calculatedOutline}
            size={size}
            statusItems={statusItems}
          />
        </AvatarFallback>
      </ConditionalWrapper>
    );
  }
);
