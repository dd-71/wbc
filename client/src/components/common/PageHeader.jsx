
const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  gradientFrom = "from-primaryColor",
  gradientTo = "to-[#617cf5]",
}) => {
  return (
    <div className="flex items-end gap-3">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-b ${gradientFrom} ${gradientTo} flex items-center justify-center shadow`}
      >
        {Icon && <Icon size={20} className="text-white" />}
      </div>

      <div className="">
        <h1 className="2xl:text-2xl text-xl font-semibold text-primaryColor leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
